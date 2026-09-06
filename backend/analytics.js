import jwt from 'jsonwebtoken';
import { db } from './firebase.js';

const JWT_SECRET = process.env.JWT_SECRET;

function getAuthenticatedUser(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'missing or invalid authorization header' });
    return null;
  }

  try {
    return jwt.verify(authHeader.slice('Bearer '.length), JWT_SECRET);
  } catch (err) {
    res.status(401).json({ error: 'invalid or expired token' });
    return null;
  }
}

async function getUserApplications(userId) {
  const snapshot = await db.collection('applications').where('userId', '==', userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function normalized(value) {
  return String(value ?? '').trim().toLowerCase().replace(/[_ ]/g, '-');
}

function hasStage(application, stages) {
  return stages.includes(normalized(application.status)) || stages.includes(normalized(application.stage));
}

function countResponse(res, count) {
  return res.status(200).json({ count });
}

async function countStage(req, res, next, stages) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const applications = await getUserApplications(user.uid);
    return countResponse(res, applications.filter((application) => hasStage(application, stages)).length);
  } catch (err) {
    return next(err);
  }
}

export function getApplied(req, res, next) {
  return countStage(req, res, next, ['applied', 'application']);
}

export function getOnlineAssessments(req, res, next) {
  return countStage(req, res, next, ['oa', 'online-assessment', 'online-assessments']);
}

export function getInterviews(req, res, next) {
  return countStage(req, res, next, [
    'interview',
    'interviews',
    'behavioural',
    'behavioral',
    'technical',
    'behavioural-interview',
    'behavioral-interview',
    'technical-interview',
  ]);
}

export function getBehaviouralInterviews(req, res, next) {
  return countStage(req, res, next, ['behavioural', 'behavioral', 'behavioural-interview', 'behavioral-interview']);
}

export function getTechnicalInterviews(req, res, next) {
  return countStage(req, res, next, ['technical', 'technical-interview']);
}

export function getOffers(req, res, next) {
  return countStage(req, res, next, ['offer', 'offers', 'accepted']);
}

export function getDeclined(req, res, next) {
  return countStage(req, res, next, ['declined', 'decline']);
}

export function getRejections(req, res, next) {
  return countStage(req, res, next, ['rejected', 'rejection', 'rejections']);
}

export async function getCompanies(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const applications = await getUserApplications(user.uid);
    const companies = new Set(applications.map((application) => application.companyId).filter(Boolean));
    return countResponse(res, companies.size);
  } catch (err) {
    return next(err);
  }
}

export async function getRoles(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const applications = await getUserApplications(user.uid);
    const roles = new Set(applications.map((application) => application.role).filter(Boolean));
    return countResponse(res, roles.size);
  } catch (err) {
    return next(err);
  }
}

export async function getCompanyTypes(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const applications = await getUserApplications(user.uid);
    const companyTypes = new Set(applications.map((application) => application.companyType).filter(Boolean));
    return countResponse(res, companyTypes.size);
  } catch (err) {
    return next(err);
  }
}

function dateValue(application, field) {
  return application[field] ?? application[field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
}

function daysBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  return Math.max(0, Math.round((endDate - startDate) / 86400000));
}

export async function getResponseTime(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const applications = await getUserApplications(user.uid);
    const companyApplications = applications.filter((application) => String(application.companyId) === req.params.id);
    const responseTimes = companyApplications
      .map((application) => daysBetween(dateValue(application, 'dateApplied'), dateValue(application, 'firstResponseDate')))
      .filter((value) => value !== null);

    if (responseTimes.length === 0) {
      return res.status(404).json({ error: 'no response time found for company' });
    }

    const averageDays = responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length;
    return res.status(200).json({
      companyId: req.params.id,
      responseTimeDays: averageDays,
      applications: responseTimes.length,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getApplicationsByDay(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  const { date, startDate, endDate } = req.query;
  if (!date && (!startDate || !endDate)) {
    return res.status(400).json({ error: 'date or startDate and endDate are required' });
  }

  try {
    const applications = await getUserApplications(user.uid);
    const grouped = applications.reduce((counts, application) => {
      const appliedDate = String(dateValue(application, 'dateApplied') ?? '').slice(0, 10);
      if (appliedDate) counts[appliedDate] = (counts[appliedDate] ?? 0) + 1;
      return counts;
    }, {});

    if (date) return res.status(200).json({ date, count: grouped[date] ?? 0 });

    const counts = Object.entries(grouped)
      .filter(([appliedDate]) => appliedDate >= startDate && appliedDate <= endDate)
      .map(([appliedDate, count]) => ({ date: appliedDate, count }))
      .sort((first, second) => first.date.localeCompare(second.date));
    return res.status(200).json({ startDate, endDate, counts });
  } catch (err) {
    return next(err);
  }
}