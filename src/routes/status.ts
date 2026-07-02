import { Router } from 'express';
import { getCardStatusHandler, dismissChatbotCardHandler } from '../controllers/statusController';

const router = Router();

router.get('/cards', getCardStatusHandler);
router.post('/cards/dismiss', dismissChatbotCardHandler);

export default router;