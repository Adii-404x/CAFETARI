import { Router } from 'express';
import { register, login, getMe, getDemoAccounts, updateProfile, changePassword } from '../controllers/authController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);
router.get('/demo-accounts', getDemoAccounts);

export default router;
