import { Router } from 'express';
import * as reportController from '../controllers/reportController';

const router = Router();

router.get('/income', reportController.getIncomeReport);
router.get('/expense', reportController.getExpenseReport);
router.get('/business-projection', reportController.getBusinessProjection);
router.get('/profit-loss', reportController.getProfitLossReport);

export default router;
