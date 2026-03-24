import express from 'express';
import * as investmentController from '../controllers/investmentController.js';

const router = express.Router();

router.post('/investments', investmentController.createInvestment);
router.get('/investments', investmentController.getInvestments);
router.get('/investments/:id', investmentController.getInvestmentDetails);
router.post('/investments/:id/contributions', investmentController.addContribution);
router.put('/investments/:id/value', investmentController.updateInvestmentValue);
router.delete('/investments/:id', investmentController.deleteInvestment);

export default router;
