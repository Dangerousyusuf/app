import { Router } from 'express';
import clubsRoutes from './clubsRoutes';
import clubsOwnersRoutes from './clubsOwnersRoutes';

const router: Router = Router();

// Ana clubs route'ları
router.use('/', clubsRoutes);

// Clubs owners route'ları
router.use('/', clubsOwnersRoutes);

export default router;