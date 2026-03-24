import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/dashboard', dashboardController.getDashboard);
router.get('/dashboard/monthly', dashboardController.getMonthlyDashboard);

export default router;
