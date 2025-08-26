import express, { Router } from 'express';
import userController from '../../controllers/user/userController';
import authMiddleware from '../../middlewares/authMiddleware';

const router: Router = express.Router();

// Routes
// Get all users (admin only)
router.get('/', authMiddleware, userController.getAllUsers);

// Kullanıcı girişi (auth middleware olmadan)
router.post('/login', userController.login);

// Search users
router.get('/search', authMiddleware, userController.searchUsers);

// Test route for permissions
router.get('/test-permissions', (req, res) => {
  console.log('Test permissions route çağrıldı');
  res.json({ message: 'Test permissions route çalışıyor' });
});

// Rol yönetimi route'ları
// Get user roles
router.get('/:id/roles', authMiddleware, userController.getUserRoles);

// Assign role to user
router.post('/:id/roles', authMiddleware, userController.assignRoleToUser);

// Update user roles
router.put('/:id/roles', authMiddleware, userController.updateUserRoles);

// Remove role from user
router.delete('/:id/roles/:roleId', authMiddleware, userController.removeRoleFromUser);

// İzin yönetimi route'ları
// Get user permissions
router.get('/:id/permissions', authMiddleware, userController.getUserPermissions);

// Assign permission to user
router.post('/:id/permissions', authMiddleware, userController.assignPermissionToUser);

// Update user permissions
router.put('/:id/permissions', authMiddleware, userController.updateUserPermissions);

// Remove permission from user
router.delete('/:id/permissions/:permissionId', authMiddleware, userController.removePermissionFromUser);

// Kullanıcı CRUD işlemleri
// Get user by ID
router.get('/:id', authMiddleware, userController.getUserById);

// Update user
router.put('/:id', authMiddleware, userController.updateUser);

// Delete user
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;