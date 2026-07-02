import { Router } from 'express';
import { saveConsentHandler, getConsentHandler } from '../controllers/consentController';

const router = Router();

router.post('/', saveConsentHandler);
router.get('/', getConsentHandler);

export default router;