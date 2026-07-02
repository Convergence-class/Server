import { Router } from 'express';
import { sendMessageHandler, getChatHistoryHandler } from '../controllers/chatController';

const router = Router();

router.post('/message', sendMessageHandler);
router.get('/history', getChatHistoryHandler);

export default router;