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
      user: { 
        id: userRef.id, 
        firstName: firstName,
        lastName: lastName, 
        email: email, 
        createdAt: createdAt
      },
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
      await db.collection('users').where('email', '==', email).limit(1).get();
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

export async function logout(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'missing or invalid authorization header'
    });
  }
  const token = authHeader.slice('Bearer '.length);

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(400).json({
      error: 'invalid or expired token'
    });
  }

  try {
    await db.collection('revokedTokens').doc(token).set({
      uid: decoded.uid,
      revokedAt: new Date().toISOString(),
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });
    return res.status(200).json({ message: 'logged out' });
  } catch (err) {
    return next(err);
  }
}

export async function deleteAccount(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid authorization header' });
  }
  const token = authHeader.slice('Bearer '.length);

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }

  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'password is required to delete your account' });
  }

  try {
    const userRef = db.collection('users').doc(decoded.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'user not found' });
    }

    const user = userDoc.data();
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'invalid password' });
    }

    await userRef.delete();

    // revoke the token used to authorize this request, same as logout
    await db.collection('revokedTokens').doc(token).set({
      uid: decoded.uid,
      revokedAt: new Date().toISOString(),
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });

    return res.status(200).json({ message: 'account deleted' });
  } catch (err) {
    return next(err);
  }
}

export async function changePassword(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid authorization header' });
  }
  const token = authHeader.slice('Bearer '.length);

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'newPassword must be at least 6 characters :(' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'newPassword must be different from currentPassword' });
  }

  try {
    const userRef = db.collection('users').doc(decoded.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'user not found' });
    }

    const user = userDoc.data();
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'invalid password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({ password: hashedPassword });

    // the old token was issued under the old password; revoke it so it can't
    // keep being used, the same way logout does
    await db.collection('revokedTokens').doc(token).set({
      uid: decoded.uid,
      revokedAt: new Date().toISOString(),
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });

    return res.status(200).json({ message: 'password updated' });
  } catch (err) {
    return next(err);
  }
}