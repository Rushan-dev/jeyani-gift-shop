import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyJWT, getMe);

export default router;



