import express, { Router } from 'express';
import settingsController from '../../controllers/settings/settingsController';
import authMiddleware from '../../middlewares/authMiddleware';

const router: Router = express.Router();

// Update user theme
router.put('/theme', authMiddleware, settingsController.updateTheme);

// Get user settings
router.get('/', authMiddleware, settingsController.getUserSettings);

export default router;