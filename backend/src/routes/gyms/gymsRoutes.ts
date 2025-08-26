import express, { Router, Request, Response, NextFunction } from 'express';
const multer = require('multer');
const path = require('path');
const fs = require('fs');

import gymsController from '../../controllers/gyms/gymsController';

const {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  updateGymStatus,
  addClubToGym,
  removeClubFromGym
} = gymsController;

import authMiddleware from '../../middlewares/authMiddleware';

const router: Router = express.Router();

// Multer konfigürasyonu - gym logoları için
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = path.join(__dirname, '../../../uploads/images/gyms');
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Dosya adını benzersiz yap
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `gym-logo-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

// Dosya filtreleme - sadece resim dosyaları
const fileFilter = (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes

// GET /api/gyms - Tüm salonları getir
router.get('/', authMiddleware, getAllGyms as any);

// GET /api/gyms/:id - ID'ye göre salon getir
router.get('/:id', authMiddleware, getGymById as any);

// POST /api/gyms - Yeni salon oluştur
router.post('/', authMiddleware, upload.single('logo'), createGym as any);

// PUT /api/gyms/:id - Salon güncelle
router.put('/:id', authMiddleware, upload.single('logo'), updateGym as any);

// DELETE /api/gyms/:id - Salon sil
router.delete('/:id', authMiddleware, deleteGym as any);

// PATCH /api/gyms/:id/status - Salon durumunu güncelle
router.patch('/:id/status', authMiddleware, updateGymStatus as any);

// POST /api/gyms/:id/clubs - Salona kulüp ekle
router.post('/:id/clubs', authMiddleware, addClubToGym as any);

// DELETE /api/gyms/:id/clubs/:clubId - Salondan kulüp kaldır
router.delete('/:id/clubs/:clubId', authMiddleware, removeClubFromGym as any);

export default router;
export { router as gymsRouter };