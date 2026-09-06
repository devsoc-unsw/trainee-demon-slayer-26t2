import { describe, it, expect, vi, beforeEach } from 'vitest';

const { events } = vi.hoisted(() => {
  const events = {
    id: 'event-1',
    where: vi.fn(),
    get: vi.fn(),
    doc: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  events.where.mockReturnValue(events);
  events.doc.mockReturnValue(events);
  return { events };
});

vi.mock('../../firebase.js', () => ({
  db: { collection: vi.fn(() => events) },
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() },
}));

import jwt from 'jsonwebtoken';
import { createEvent, deleteEvent, editEvent, getEvents } from '../calendar.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const eventBody = {
  title: 'Technical interview',
  startDate: '2026-09-10',
  endDate: '2026-09-10',
  startTime: '10:00',
  endTime: '11:00',
  type: 'interview',
};

beforeEach(() => {
  vi.clearAllMocks();
  jwt.verify.mockReturnValue({ uid: 'user-1' });
  events.where.mockReturnValue(events);
  events.doc.mockReturnValue(events);
  events.get.mockResolvedValue({ empty: true, docs: [] });
  events.set.mockResolvedValue(undefined);
  events.update.mockResolvedValue(undefined);
  events.delete.mockResolvedValue(undefined);
});

describe('calendar handlers', () => {
  it('rejects requests without a bearer token', async () => {
    const res = mockRes();

    await getEvents({ headers: {} }, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(events.where).not.toHaveBeenCalled();
  });

  it('returns only the authenticated user events', async () => {
    events.get.mockResolvedValueOnce({
      docs: [{ id: 'event-1', data: () => ({ title: eventBody.title, userId: 'user-1' }) }],
    });
    const res = mockRes();

    await getEvents({ headers: { authorization: 'Bearer token' } }, res, vi.fn());

    expect(events.where).toHaveBeenCalledWith('userId', '==', 'user-1');
    expect(res.json).toHaveBeenCalledWith({
      events: [{ id: 'event-1', title: eventBody.title, userId: 'user-1' }],
    });
  });

  it('creates an event owned by the authenticated user', async () => {
    const res = mockRes();

    await createEvent(
      { headers: { authorization: 'Bearer token' }, body: eventBody },
      res,
      vi.fn()
    );

    expect(events.set).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      title: eventBody.title,
      type: eventBody.type,
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('does not delete an event owned by another user', async () => {
    events.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ userId: 'user-2' }),
    });
    const res = mockRes();

    await deleteEvent(
      { headers: { authorization: 'Bearer token' }, params: { id: 'event-1' } },
      res,
      vi.fn()
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(events.delete).not.toHaveBeenCalled();
  });

  it('updates an event owned by the authenticated user', async () => {
    events.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ userId: 'user-1', title: 'Old title' }),
    });
    const res = mockRes();

    await editEvent(
      { headers: { authorization: 'Bearer token' }, params: { id: 'event-1' }, body: eventBody },
      res,
      vi.fn()
    );

    expect(events.update).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      title: eventBody.title,
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });
});