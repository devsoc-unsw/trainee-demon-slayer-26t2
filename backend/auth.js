import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../firebase.js';

const JWT_SECRET = process.env.JWT_SECRET;

// user signup function for auth
export async function signup(req, res, next) {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'email, password, firstName, and lastName are required!' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters :(' });
  }

  try {
    const existing = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    const userRef = db.collection('users').doc();
    await userRef.set({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      createdAt,
    });

    const token = jwt.sign({ uid: userRef.id, email }, JWT_SECRET, { algorithm: 'HS256' });

    return res.status(201).json({
      token,
      user: { id: userRef.id, firstName, lastName, email, createdAt },
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      error: 'email and password are required'
    });
  }

  try {
    const snapshot = 
      await db.collection('users').where('emmail', '==', email).limit(1).get();
    if (snapshot.empty) {
      return res.status(401).json({
        error: 'invalid email or password'
      });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        error: 'invalid email or password'
      });
    }

    const token = jwt.sign({ uid: userDoc.id, email }, JWT_SECRET, { algorithm: 'HS256' });
    
    return res.status(200).json({
      token,
      user: {
        id: userDoc.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}