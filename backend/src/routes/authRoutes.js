import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.get('/family-users', authenticateToken, authController.getFamilyUsers);
router.post('/family-users', authenticateToken, requireAdmin, authController.createFamilyUser);
router.put('/family-users/:id', authenticateToken, requireAdmin, authController.updateFamilyUser);

export default router;
