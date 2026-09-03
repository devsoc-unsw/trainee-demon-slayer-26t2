import express from 'express';
import { signup, login, logout, deleteAccount, changePassword } from '../auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.delete('/account', deleteAccount);
router.patch('/change-password', changePassword);

export default router;