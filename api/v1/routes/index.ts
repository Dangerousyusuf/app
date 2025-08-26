import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './auth';
import profileRoutes from './profile';
import userRoutes from './user';
import settingsRoutes from './settings';
import permissionsRoutes from './permissions';
import { proxyRequest } from '../../utils/httpClient';
import { urlUtils } from '../config/urls';

const router = express.Router();

// Route modülleri
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/permissions', permissionsRoutes);

// Roles rotası - Backend'e proxy
router.use('/roles', async (req: Request, res: Response, next: NextFunction) => {
  console.log('ROLES MIDDLEWARE TRIGGERED');
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  
  const cleanPath = req.originalUrl.replace('/api/v1', '');
  const targetUrl = urlUtils.getBackendApiUrl(cleanPath);
  
  console.log('Clean Path:', cleanPath);
  console.log('Target URL:', targetUrl);
  
  try {
    await proxyRequest(req, res, targetUrl);
  } catch (error) {
    console.error('Roles proxy error:', error);
    next(error);
  }
});

// Clubs rotası - Backend'e proxy
router.use('/clubs', async (req: Request, res: Response, next: NextFunction) => {
  console.log('CLUBS MIDDLEWARE TRIGGERED');
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  
  const cleanPath = req.originalUrl.replace('/api/v1', '');
  const targetUrl = urlUtils.getBackendApiUrl(cleanPath);
  
  console.log('Clean Path:', cleanPath);
  console.log('Target URL:', targetUrl);
  
  try {
    await proxyRequest(req, res, targetUrl);
  } catch (error) {
    console.error('Clubs proxy error:', error);
    next(error);
  }
});

// Gyms rotası - Backend'e proxy
router.use('/gyms', async (req: Request, res: Response, next: NextFunction) => {
  console.log('GYMS MIDDLEWARE TRIGGERED');
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  
  const cleanPath = req.originalUrl.replace('/api/v1', '');
  const targetUrl = urlUtils.getBackendApiUrl(cleanPath);
  
  console.log('Clean Path:', cleanPath);
  console.log('Target URL:', targetUrl);
  
  try {
    await proxyRequest(req, res, targetUrl);
  } catch (error) {
    console.error('Gyms proxy error:', error);
    next(error);
  }
});

// API sağlık kontrolü
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

export default router;