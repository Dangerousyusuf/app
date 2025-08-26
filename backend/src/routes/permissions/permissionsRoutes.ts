import express, { Router } from 'express';
import {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionsByModule
} from '../../controllers/permissions/permissionsController';
import {
  createPermissionValidation,
  updatePermissionValidation,
  idValidation,
  moduleValidation
} from '../../validators/permissionsValidator';

import authMiddleware from '../../middlewares/authMiddleware';

const router: Router = express.Router();

// Tüm izinleri getir
router.get('/', authMiddleware, getAllPermissions);

// ID ile izin getir
router.get('/:id', authMiddleware, idValidation, getPermissionById);

// Modüle göre izinleri getir
router.get('/module/:module', authMiddleware, moduleValidation, getPermissionsByModule);

// Yeni izin oluştur
router.post('/', authMiddleware, createPermissionValidation, createPermission);

// İzin güncelle
router.put('/:id', authMiddleware, updatePermissionValidation, updatePermission);

// İzin sil
router.delete('/:id', authMiddleware, idValidation, deletePermission);

export default router;