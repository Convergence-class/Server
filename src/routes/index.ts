import { Router } from 'express';
import authRouter from './auth';
import usageRouter from './usage';
import cesdRouter from './cesd';
import chatRouter from './chat';
import noticeRouter from './notice';
import consentRouter from './consent';
import statusRouter from './status';

const router = Router();

router.use('/auth', authRouter);
router.use('/usage', usageRouter);
router.use('/cesd', cesdRouter);
router.use('/chat', chatRouter);
router.use('/notice', noticeRouter);
router.use('/consent', consentRouter);
router.use('/status', statusRouter);

export default router;
