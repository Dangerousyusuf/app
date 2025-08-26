import express, { Router } from 'express';
import * as authController from '../../controllers/auth/authController';

const router: Router = express.Router();

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

export default router;