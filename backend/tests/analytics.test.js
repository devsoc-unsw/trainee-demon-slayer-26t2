import { describe, it, expect, vi, beforeEach } from 'vitest';

const { applications } = vi.hoisted(() => {
  const applications = {
    where: vi.fn(),
    get: vi.fn(),
  };
  applications.where.mockReturnValue(applications);
  return { applications };
});

vi.mock('../../firebase.js', () => ({
  db: { collection: vi.fn(() => applications) },
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() },
}));

import jwt from 'jsonwebtoken';
import {
  getApplied,
  getBehaviouralInterviews,
  getApplicationsByDay,
  getCompanyTypes,
  getCompanies,
  getInterviews,
  getResponseTime,
  getRoles,
  getOffers,
} from '../analytics.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const userApplications = [
  {
    id: 'application-1',
    userId: 'user-1',
    companyId: 'company-1',
    role: 'Software Engineer',
    companyType: 'tech',
    status: 'applied',
    dateApplied: '2026-09-01',
    firstResponseDate: '2026-09-04',
  },
  {
    id: 'application-2',
    userId: 'user-1',
    companyId: 'company-2',
    role: 'Data Engineer',
    companyType: 'finance',
    status: 'accepted',
    dateApplied: '2026-09-01',
    firstResponseDate: '2026-09-02',
  },
  {
    id: 'application-3',
    userId: 'user-1',
    companyId: 'company-1',
    role: 'Software Engineer',
    companyType: 'tech',
    status: 'behavioural-interview',
    dateApplied: '2026-09-05',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  jwt.verify.mockReturnValue({ uid: 'user-1' });
  applications.where.mockReturnValue(applications);
  applications.get.mockResolvedValue({
    docs: userApplications.map((application) => ({
      id: application.id,
      data: () => application,
    })),
  });
});

const authenticatedRequest = (query = {}, params = {}) => ({
  headers: { authorization: 'Bearer token' },
  query,
  params,
});

describe('analytics handlers', () => {
  it('rejects unauthenticated requests', async () => {
    const res = mockRes();

    await getApplied({ headers: {} }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(applications.where).not.toHaveBeenCalled();
  });

  it('counts application stages and normalizes stage aliases', async () => {
    const res = mockRes();

    await getOffers(authenticatedRequest(), res, vi.fn());

    expect(applications.where).toHaveBeenCalledWith('userId', '==', 'user-1');
    expect(res.json).toHaveBeenCalledWith({ count: 1 });
  });

  it('counts distinct companies, roles, and company types', async () => {
    const companies = mockRes();
    const roles = mockRes();
    const companyTypes = mockRes();

    await getCompanies(authenticatedRequest(), companies, vi.fn());
    await getRoles(authenticatedRequest(), roles, vi.fn());
    await getCompanyTypes(authenticatedRequest(), companyTypes, vi.fn());

    expect(companies.json).toHaveBeenCalledWith({ count: 2 });
    expect(roles.json).toHaveBeenCalledWith({ count: 2 });
    expect(companyTypes.json).toHaveBeenCalledWith({ count: 2 });
  });

  it('calculates average response time for a company', async () => {
    const res = mockRes();

    await getResponseTime(authenticatedRequest({}, { id: 'company-1' }), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({
      companyId: 'company-1',
      responseTimeDays: 3,
      applications: 1,
    });
  });

  it('returns application counts for a requested day and date range', async () => {
    const day = mockRes();
    const range = mockRes();

    await getApplicationsByDay(authenticatedRequest({ date: '2026-09-01' }), day, vi.fn());
    await getApplicationsByDay(
      authenticatedRequest({ startDate: '2026-09-01', endDate: '2026-09-05' }),
      range,
      vi.fn()
    );

    expect(day.json).toHaveBeenCalledWith({ date: '2026-09-01', count: 2 });
    expect(range.json).toHaveBeenCalledWith({
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      counts: [
        { date: '2026-09-01', count: 2 },
        { date: '2026-09-05', count: 1 },
      ],
    });
  });

  it('counts behavioural interviews as an interview stage', async () => {
    const res = mockRes();

    await getBehaviouralInterviews(authenticatedRequest(), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ count: 1 });
  });

  it('includes behavioural and technical interview records in total interviews', async () => {
    const res = mockRes();

    await getInterviews(authenticatedRequest(), res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ count: 1 });
  });
});