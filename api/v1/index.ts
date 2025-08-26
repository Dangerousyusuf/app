import express, { Request, Response } from 'express';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import userRoutes from './routes/user';
import settingsRoutes from './routes/settings';
import rolesRoutes from './routes/roles';
import permissionsRoutes from './routes/permissions';
import clubsRoutes from './routes/index'; // Clubs proxy routes

const router = express.Router();

// API v1 Routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/', clubsRoutes); // Clubs proxy routes

// API v1 Health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API v1 is working',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;