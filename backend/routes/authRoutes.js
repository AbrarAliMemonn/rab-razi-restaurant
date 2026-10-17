import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, updateProfile, addAddress } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiter for authentication routes: max 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// Public authentication routes protected with rate limiter
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes (Require verified JWT)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/address', authenticateToken, addAddress);

export default router;
