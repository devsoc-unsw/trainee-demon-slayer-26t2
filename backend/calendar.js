import jwt from 'jsonwebtoken';
import { db } from '../firebase.js';

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

function eventData(body, userId) {
  const { title, startDate, endDate, startTime, endTime, notes, repetitions, companyId, type } = body;
  return {
    userId,
    title,
    startDate,
    endDate,
    startTime,
    endTime,
    notes: notes ?? '',
    repetitions: repetitions ?? null,
    companyId: companyId ?? null,
    type: type ?? null,
    updatedAt: new Date().toISOString(),
  };
}

function validateEvent(body) {
  const requiredFields = ['title', 'startDate', 'endDate', 'startTime', 'endTime'];
  return requiredFields.every((field) => body[field]);
}

export async function getEvents(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const snapshot = await db.collection('events').where('userId', '==', user.uid).get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ events });
  } catch (err) {
    return next(err);
  }
}

export async function createEvent(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  if (!validateEvent(req.body)) {
    return res.status(400).json({
      error: 'title, startDate, endDate, startTime, and endTime are required',
    });
  }

  try {
    const eventRef = db.collection('events').doc();
    const event = {
      ...eventData(req.body, user.uid),
      createdAt: new Date().toISOString(),
    };
    await eventRef.set(event);
    return res.status(201).json({ event: { id: eventRef.id, ...event } });
  } catch (err) {
    return next(err);
  }
}

export async function deleteEvent(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  try {
    const eventRef = db.collection('events').doc(req.params.id);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data().userId !== user.uid) {
      return res.status(404).json({ error: 'event not found' });
    }

    await eventRef.delete();
    return res.status(200).json({ message: 'event deleted' });
  } catch (err) {
    return next(err);
  }
}

export async function editEvent(req, res, next) {
  const user = getAuthenticatedUser(req, res);
  if (!user) return;

  if (!validateEvent(req.body)) {
    return res.status(400).json({
      error: 'title, startDate, endDate, startTime, and endTime are required',
    });
  }

  try {
    const eventRef = db.collection('events').doc(req.params.id);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists || eventDoc.data().userId !== user.uid) {
      return res.status(404).json({ error: 'event not found' });
    }

    const updatedEvent = eventData(req.body, user.uid);
    await eventRef.update(updatedEvent);
    return res.status(200).json({
      event: { id: req.params.id, ...eventDoc.data(), ...updatedEvent },
    });
  } catch (err) {
    return next(err);
  }
}