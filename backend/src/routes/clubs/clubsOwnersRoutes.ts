import express, { Router } from 'express';
import {
  getClubOwners,
  addOwnerToClub,
  removeOwnerFromClub,
  updateOwnership
} from '../../controllers/clubs/clubsOwnersController';
import { body } from 'express-validator';
import authMiddleware from '../../middlewares/authMiddleware';

const router: Router = express.Router();

// Kulübün sahiplerini getir
// GET /api/clubs/:clubId/owners
router.get('/:clubId/owners', authMiddleware, getClubOwners);

// Kulübe sahip ekle
// POST /api/clubs/:clubId/owners
router.post('/:clubId/owners', authMiddleware, [
  body('user_id')
    .notEmpty()
    .withMessage('Kullanıcı ID gereklidir')
    .isInt({ min: 1 })
    .withMessage('Geçerli bir kullanıcı ID giriniz'),
  body('ownership_type')
    .optional()
    .isIn(['owner', 'co_owner', 'partner', 'investor'])
    .withMessage('Geçersiz sahiplik tipi'),
  body('ownership_percentage')
    .optional()
    .isFloat({ min: 0.01, max: 100 })
    .withMessage('Sahiplik yüzdesi 0.01-100 arasında olmalıdır'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir tarih formatı giriniz (YYYY-MM-DD)')
], addOwnerToClub);

// Kulüpten sahip kaldır
// DELETE /api/clubs/:clubId/owners/:ownerId
router.delete('/:clubId/owners/:ownerId', authMiddleware, removeOwnerFromClub);

// Sahiplik bilgilerini güncelle
// PUT /api/clubs/:clubId/owners/:ownerId
router.put('/:clubId/owners/:ownerId', authMiddleware, [
  body('ownership_type')
    .optional()
    .isIn(['owner', 'co_owner', 'partner', 'investor'])
    .withMessage('Geçersiz sahiplik tipi'),
  body('ownership_percentage')
    .optional()
    .isFloat({ min: 0.01, max: 100 })
    .withMessage('Sahiplik yüzdesi 0.01-100 arasında olmalıdır')
], updateOwnership);

export default router;