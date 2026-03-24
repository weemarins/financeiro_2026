import express from 'express';
import * as authController from '../controllers/authController.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', loginLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', authController.changePassword);
router.get('/family-users', authController.getFamilyUsers);

export default router;
