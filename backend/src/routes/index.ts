import express, { Router, Request, Response } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import userRoutes from './user';
import settingsRoutes from './settings/settingsRoutes';
import rolesRoutes from './roles';
import permissionsRoutes from './permissions';
import clubsRoutes from './clubs';
import gymsRoutes from './gyms/gymsRoutes';

const router: Router = express.Router();

// Route modülleri
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/clubs', clubsRoutes);
router.use('/gyms', gymsRoutes);

// API sağlık kontrolü
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

export default router;