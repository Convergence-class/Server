import { Router } from 'express';
import {
  submitCESDHandler,
  getCESDResultHandler,
  getCESDQuestionsHandler,
} from '../controllers/cesdController';

const router = Router();

router.get('/questions', getCESDQuestionsHandler);
router.post('/submit', submitCESDHandler);
router.get('/result', getCESDResultHandler);

export default router;