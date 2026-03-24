import express from 'express';
import * as creditCardController from '../controllers/creditCardController.js';

const router = express.Router();

router.post('/cards', creditCardController.createCard);
router.get('/cards', creditCardController.getCards);
router.get('/cards/:id', creditCardController.getCardDetails);
router.post('/cards/:cardId/transactions', creditCardController.addTransaction);
router.put('/cards/:id', creditCardController.updateCard);
router.delete('/cards/:id', creditCardController.deactivateCard);

export default router;
