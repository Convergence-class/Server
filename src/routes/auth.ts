import { Router } from 'express';
import { signUpHandler, signInHandler, signOutHandler } from '../controllers/authController';

const router = Router();

router.post('/signup', signUpHandler);
router.post('/login', signInHandler);
router.post('/logout', signOutHandler);

export default router;