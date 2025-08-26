import express, { Router } from 'express';
import {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getRolePermissions
} from '../../controllers/roles/rolesController';
import authMiddleware from '../../middlewares/authMiddleware';

const router: Router = express.Router();

// Tüm rol işlemleri için authentication gerekli
router.use(authMiddleware);

// POST /roles - Yeni rol oluştur
router.post('/', createRole);

// GET /roles - Rolleri listele
router.get('/', getRoles);

// PUT /roles/:id - Rol güncelle
router.put('/:id', updateRole);

// DELETE /roles/:id - Rol sil
router.delete('/:id', deleteRole);

// PUT /roles/:id/permissions - Rol izinlerini güncelle
router.put('/:id/permissions', updateRolePermissions);

// GET /roles/:id/permissions - Rol izinlerini getir
router.get('/:id/permissions', getRolePermissions);

export default router;