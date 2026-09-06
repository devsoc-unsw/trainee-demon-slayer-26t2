import jwt from 'jsonwebtoken';
import { db } from './firebase.js';

const JWT_SECRET = process.env.JWT_SECRET;

function getAuthenticatedUser(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'missing or invalid authorization header',
    });
    return null;
  }

  try {
    return jwt.verify(
      authHeader.slice('Bearer '.length),
      JWT_SECRET
    );
  } catch (err) {
    res.status(401).json({
      error: 'invalid or expired token',
    });
    return null;
  }
}

function applicationData(body, userId) {
  return {
    userId,
    companyId: body.companyId ?? '',
    companyName: body.companyName ?? '',
    companyType: body.companyType ?? '',
    role: body.role ?? '',
    status: body.status ?? 'applied',
    dateApplied: body.dateApplied ?? '',
    firstResponseDate: body.firstResponseDate ?? null,
    notes: body.notes ?? '',
    updatedAt: new Date().toISOString(),
  };
}

function validateApplication(body) {
  const requiredFields = [
    'companyName',
    'role',
    'status',
    'dateApplied',
  ];

  return requiredFields.every(
    (field) =>
      body[field] !== undefined &&
      body[field] !== null &&
      String(body[field]).trim() !== ''
  );
}


// GET ALL APPLICATIONS
export async function getApplications(req, res, next) {
  const user = getAuthenticatedUser(req, res);

  if (!user) return;

  try {
    const snapshot = await db
      .collection('applications')
      .where('userId', '==', user.uid)
      .get();

    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      applications,
    });
  } catch (err) {
    return next(err);
  }
}


// GET ONE APPLICATION
export async function getApplication(req, res, next) {
  const user = getAuthenticatedUser(req, res);

  if (!user) return;

  try {
    const applicationRef = db
      .collection('applications')
      .doc(req.params.id);

    const applicationDoc = await applicationRef.get();

    if (
      !applicationDoc.exists ||
      applicationDoc.data().userId !== user.uid
    ) {
      return res.status(404).json({
        error: 'application not found',
      });
    }

    return res.status(200).json({
      application: {
        id: applicationDoc.id,
        ...applicationDoc.data(),
      },
    });
  } catch (err) {
    return next(err);
  }
}


// CREATE APPLICATION
export async function createApplication(req, res, next) {
  const user = getAuthenticatedUser(req, res);

  if (!user) return;

  if (!validateApplication(req.body)) {
    return res.status(400).json({
      error:
        'companyName, role, status, and dateApplied are required',
    });
  }

  try {
    const applicationRef = db
      .collection('applications')
      .doc();

    const application = {
      ...applicationData(req.body, user.uid),
      createdAt: new Date().toISOString(),
    };

    await applicationRef.set(application);

    return res.status(201).json({
      application: {
        id: applicationRef.id,
        ...application,
      },
    });
  } catch (err) {
    return next(err);
  }
}


// EDIT APPLICATION
export async function editApplication(req, res, next) {
  const user = getAuthenticatedUser(req, res);

  if (!user) return;

  if (!validateApplication(req.body)) {
    return res.status(400).json({
      error:
        'companyName, role, status, and dateApplied are required',
    });
  }

  try {
    const applicationRef = db
      .collection('applications')
      .doc(req.params.id);

    const applicationDoc = await applicationRef.get();

    if (
      !applicationDoc.exists ||
      applicationDoc.data().userId !== user.uid
    ) {
      return res.status(404).json({
        error: 'application not found',
      });
    }

    const updatedApplication = applicationData(
      req.body,
      user.uid
    );

    await applicationRef.update(updatedApplication);

    return res.status(200).json({
      application: {
        id: req.params.id,
        ...applicationDoc.data(),
        ...updatedApplication,
      },
    });
  } catch (err) {
    return next(err);
  }
}


// DELETE APPLICATION
export async function deleteApplication(req, res, next) {
  const user = getAuthenticatedUser(req, res);

  if (!user) return;

  try {
    const applicationRef = db
      .collection('applications')
      .doc(req.params.id);

    const applicationDoc = await applicationRef.get();

    if (
      !applicationDoc.exists ||
      applicationDoc.data().userId !== user.uid
    ) {
      return res.status(404).json({
        error: 'application not found',
      });
    }

    await applicationRef.delete();

    return res.status(200).json({
      message: 'application deleted',
    });
  } catch (err) {
    return next(err);
  }
}