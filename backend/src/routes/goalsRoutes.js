import express from 'express';
import * as goalsController from '../controllers/goalsController.js';

const router = express.Router();

// Goals
router.post('/goals', goalsController.createGoal);
router.get('/goals', goalsController.getGoals);
router.get('/goals/:id', goalsController.getGoalDetails);
router.put('/goals/:id/progress', goalsController.updateGoalProgress);
router.delete('/goals/:id', goalsController.deleteGoal);

// Emergency Fund
router.get('/emergency-fund', goalsController.getEmergencyFund);
router.post('/emergency-fund', goalsController.createEmergencyFund);
router.put('/emergency-fund/add', goalsController.addToEmergencyFund);
router.put('/emergency-fund/target', goalsController.updateEmergencyFundTarget);
router.get('/emergency-fund/suggestion', goalsController.calculateEmergencyFundSuggestion);

export default router;
