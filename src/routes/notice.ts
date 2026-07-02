import { Router } from 'express';
import { getRandomNoticeHandler } from '../controllers/noticeController';

const router = Router();

router.get('/random', getRandomNoticeHandler);

export default router;
