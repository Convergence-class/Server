import { Router } from 'express';
import { logUsage, getUsageSummaryHandler } from '../controllers/usageController';

const router = Router();

router.post('/log', logUsage);
router.get('/summary', getUsageSummaryHandler);

export default router;