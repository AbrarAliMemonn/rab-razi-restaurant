import express from 'express';
import { getActiveSettings, updateActiveSettings } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/settings - Public
router.get('/', getActiveSettings);

// PUT /api/settings - Protected (Admin only)
router.put('/', authenticateToken, updateActiveSettings);

export default router;
