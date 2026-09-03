import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock Firestore ---------------------------------------------------
// One fake "collection" object per collection name, reused across calls
// within a test (chainable via `() => obj`), so
// db.collection('users').where(...).limit(...).get() and
// db.collection('users').doc(id).set(...) all resolve against the same
// spies we can assert on.
//
// vi.mock(...) factories are hoisted above all other top-level code, so
// anything they reference must be created via vi.hoisted() to avoid a
// "Cannot access before initialization" error.
const { collectionMocks, getCollectionMock, mockCollection } = vi.hoisted(() => {
  const collectionMocks = {};
  function getCollectionMock(name) {
    if (!collectionMocks[name]) {
      const obj = { id: 'mock-id' };
      obj.where = vi.fn(() => obj);
      obj.limit = vi.fn(() => obj);
      obj.get = vi.fn();
      obj.doc = vi.fn(() => obj);
      obj.set = vi.fn();
      obj.update = vi.fn();
      obj.delete = vi.fn();
      collectionMocks[name] = obj;
    }
    return collectionMocks[name];
  }
  const mockCollection = vi.fn((name) => getCollectionMock(name));
  return { collectionMocks, getCollectionMock, mockCollection };
});

vi.mock('../../firebase.js', () => ({
  db: { collection: mockCollection },
}));

// --- Mock bcrypt / jsonwebtoken ---------------------------------------
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signup, login, logout, deleteAccount, changePassword } from '../auth.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Restore benign defaults so every 'get' call resolves to *something*
  // unless a test overrides it.
  for (const name of Object.keys(collectionMocks)) {
    collectionMocks[name].get.mockResolvedValue({ empty: true, docs: [] });
    collectionMocks[name].set.mockResolvedValue(undefined);
    collectionMocks[name].update.mockResolvedValue(undefined);
    collectionMocks[name].delete.mockResolvedValue(undefined);
  }
});

describe('signup', () => {
  const validBody = {
    email: 'ann@example.com',
    password: 'password123',
    firstName: 'Ann',
    lastName: 'Lee',
  };

  it('400s when a required field is missing', async () => {
    const req = { body: { ...validBody, firstName: undefined } };
    const res = mockRes();
    const next = vi.fn();

    await signup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'email, password, firstName, and lastName are required!',
    });
  });

  it('400s when password is shorter than 6 characters', async () => {
    const req = { body: { ...validBody, password: '123' } };
    const res = mockRes();
    const next = vi.fn();

    await signup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'password must be at least 6 characters :(',
    });
  });

  it('409s when the email is already registered', async () => {
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ empty: false, docs: [{ id: 'existing' }] });

    const req = { body: validBody };
    const res = mockRes();
    const next = vi.fn();

    await signup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'email already in use' });
  });

  it('creates the user, hashes the password, and returns a token on success', async () => {
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ empty: true, docs: [] });
    bcrypt.hash.mockResolvedValueOnce('hashed-pw');
    jwt.sign.mockReturnValueOnce('signed-token');

    const req = { body: validBody };
    const res = mockRes();
    const next = vi.fn();

    await signup(req, res, next);

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(users.set).toHaveBeenCalledWith(
      expect.objectContaining({
        email: validBody.email,
        firstName: validBody.firstName,
        lastName: validBody.lastName,
        password: 'hashed-pw',
        createdAt: expect.any(String),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      token: 'signed-token',
      user: expect.objectContaining({ email: validBody.email }),
    });
  });

  it('forwards unexpected errors to next()', async () => {
    const users = getCollectionMock('users');
    const dbError = new Error('firestore is down');
    users.get.mockRejectedValueOnce(dbError);

    const req = { body: validBody };
    const res = mockRes();
    const next = vi.fn();

    await signup(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  const credentials = { email: 'ann@example.com', password: 'password123' };
  const storedUser = {
    firstName: 'Ann',
    lastName: 'Lee',
    email: 'ann@example.com',
    password: 'hashed-pw',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('400s when email or password is missing', async () => {
    const req = { body: { email: 'ann@example.com' } };
    const res = mockRes();
    const next = vi.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('queries Firestore by the "email" field (regression check)', async () => {
    // NOTE: the handler currently queries .where('emmail', ...) — a typo.
    // This assertion documents the intended behavior and will fail until
    // that's fixed to .where('email', ...).
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ empty: true, docs: [] });

    const req = { body: credentials };
    const res = mockRes();
    const next = vi.fn();

    await login(req, res, next);

    expect(users.where).toHaveBeenCalledWith('email', '==', credentials.email);
  });

  it('401s when no user matches the email', async () => {
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ empty: true, docs: [] });

    const req = { body: credentials };
    const res = mockRes();
    const next = vi.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid email or password' });
  });

  it('401s when the password does not match', async () => {
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: 'uid1', data: () => storedUser }],
    });
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = { body: credentials };
    const res = mockRes();
    const next = vi.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid email or password' });
  });

  it('logs in and returns a token on success', async () => {
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: 'uid1', data: () => storedUser }],
    });
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValueOnce('signed-token');

    const req = { body: credentials };
    const res = mockRes();
    const next = vi.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: 'signed-token',
      user: expect.objectContaining({ id: 'uid1', email: storedUser.email }),
    });
  });

  it('forwards unexpected errors to next()', async () => {
    const users = getCollectionMock('users');
    const dbError = new Error('firestore is down');
    users.get.mockRejectedValueOnce(dbError);

    const req = { body: credentials };
    const res = mockRes();
    const next = vi.fn();

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('logout', () => {
  it('401s when the authorization header is missing', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    await logout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401s when the authorization header is not a Bearer token', async () => {
    const req = { headers: { authorization: 'Basic abc123' } };
    const res = mockRes();
    const next = vi.fn();

    await logout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401s when the token fails verification', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = mockRes();
    const next = vi.fn();

    await logout(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid or expired token' });
  });

  it('revokes the token and returns 200 on success', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    jwt.verify.mockReturnValueOnce({ uid: 'uid1', email: 'ann@example.com', exp: futureExp });
    const revoked = getCollectionMock('revokedTokens');

    const req = { headers: { authorization: 'Bearer good-token' } };
    const res = mockRes();
    const next = vi.fn();

    await logout(req, res, next);

    expect(revoked.doc).toHaveBeenCalledWith('good-token');
    expect(revoked.set).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'uid1', revokedAt: expect.any(String) })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('forwards unexpected errors to next()', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    jwt.verify.mockReturnValueOnce({ uid: 'uid1', exp: futureExp });
    const revoked = getCollectionMock('revokedTokens');
    const dbError = new Error('firestore is down');
    revoked.set.mockRejectedValueOnce(dbError);

    const req = { headers: { authorization: 'Bearer good-token' } };
    const res = mockRes();
    const next = vi.fn();

    await logout(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('deleteAccount', () => {
  const storedUser = {
    email: 'ann@example.com',
    firstName: 'Ann',
    lastName: 'Lee',
    password: 'hashed-pw',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  function authedReq(overrides = {}) {
    return {
      headers: { authorization: 'Bearer good-token' },
      body: { password: 'password123' },
      ...overrides,
    };
  }

  it('401s when the authorization header is missing or malformed', async () => {
    const req = { headers: {}, body: { password: 'password123' } };
    const res = mockRes();
    const next = vi.fn();

    await deleteAccount(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401s when the token fails verification', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await deleteAccount(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid or expired token' });
  });

  it('400s when password is missing from the body', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });

    const req = authedReq({ body: {} });
    const res = mockRes();
    const next = vi.fn();

    await deleteAccount(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('404s when the user no longer exists', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ exists: false });

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await deleteAccount(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('401s when the password does not match', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ exists: true, data: () => storedUser });
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await deleteAccount(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid password' });
  });

  it('deletes the user, revokes the token, and returns 200 on success', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    jwt.verify.mockReturnValueOnce({ uid: 'uid1', exp: futureExp });
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ exists: true, data: () => storedUser });
    bcrypt.compare.mockResolvedValueOnce(true);
    const revoked = getCollectionMock('revokedTokens');

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await deleteAccount(req, res, next);

    expect(users.delete).toHaveBeenCalled();
    expect(revoked.set).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'uid1', revokedAt: expect.any(String) })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'account deleted' });
  });

  it('forwards unexpected errors to next()', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });
    const users = getCollectionMock('users');
    const dbError = new Error('firestore is down');
    users.get.mockRejectedValueOnce(dbError);

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await deleteAccount(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});

describe('changePassword', () => {
  const storedUser = {
    email: 'ann@example.com',
    firstName: 'Ann',
    lastName: 'Lee',
    password: 'hashed-old-pw',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  function authedReq(overrides = {}) {
    return {
      headers: { authorization: 'Bearer good-token' },
      body: { currentPassword: 'oldpassword1', newPassword: 'newpassword1' },
      ...overrides,
    };
  }

  it('401s when the authorization header is missing or malformed', async () => {
    const req = { headers: {}, body: { currentPassword: 'a', newPassword: 'b' } };
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('401s when the token fails verification', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid or expired token' });
  });

  it('400s when currentPassword or newPassword is missing', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });

    const req = authedReq({ body: { currentPassword: 'oldpassword1' } });
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('400s when newPassword is shorter than 6 characters', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });

    const req = authedReq({ body: { currentPassword: 'oldpassword1', newPassword: 'abc' } });
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'newPassword must be at least 6 characters :(',
    });
  });

  it('400s when newPassword is the same as currentPassword', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });

    const req = authedReq({
      body: { currentPassword: 'samepassword', newPassword: 'samepassword' },
    });
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'newPassword must be different from currentPassword',
    });
  });

  it('404s when the user no longer exists', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ exists: false });

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('401s when currentPassword does not match', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ exists: true, data: () => storedUser });
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid password' });
  });

  it('hashes and saves the new password, revokes the token, and returns 200 on success', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    jwt.verify.mockReturnValueOnce({ uid: 'uid1', exp: futureExp });
    const users = getCollectionMock('users');
    users.get.mockResolvedValueOnce({ exists: true, data: () => storedUser });
    bcrypt.compare.mockResolvedValueOnce(true);
    bcrypt.hash.mockResolvedValueOnce('hashed-new-pw');
    const revoked = getCollectionMock('revokedTokens');

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword1', 10);
    expect(users.update).toHaveBeenCalledWith({ password: 'hashed-new-pw' });
    expect(revoked.set).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'uid1', revokedAt: expect.any(String) })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'password updated' });
  });

  it('forwards unexpected errors to next()', async () => {
    jwt.verify.mockReturnValueOnce({ uid: 'uid1' });
    const users = getCollectionMock('users');
    const dbError = new Error('firestore is down');
    users.get.mockRejectedValueOnce(dbError);

    const req = authedReq();
    const res = mockRes();
    const next = vi.fn();

    await changePassword(req, res, next);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});