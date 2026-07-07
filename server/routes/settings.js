import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

// Public route for footer
router.get('/', getSettings);

// Admin route
router.put('/', authenticate, authorizeAdmin, updateSettings);

export default router;
