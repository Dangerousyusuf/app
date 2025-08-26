import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  updateClubStatus,
  uploadClubLogo,
  getGymsByClubId,
  connectGym,
  disconnectGym
} from '../../controllers/clubs/clubController';
import authMiddleware from '../../middlewares/authMiddleware';

const router: Router = express.Router();

// Klasör oluşturma fonksiyonu
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Multer konfigürasyonu - Logo upload
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = path.join('uploads', 'images', 'logos');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Dosya adını benzersiz yap
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + extension);
  }
});

// Dosya filtreleme
const fileFilter = (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  // Sadece resim dosyalarına izin ver
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
router.get('/', authMiddleware, getAllClubs);

// Get club by ID
router.get('/:id', authMiddleware, getClubById);

// Get gyms by club ID
router.get('/:id/gyms', authMiddleware, getGymsByClubId);

// Create new club
router.post('/', authMiddleware, createClub);

// Connect gym to club
router.post('/:id/gyms', authMiddleware, connectGym);

// Upload club logo
router.post('/:id/upload-logo', authMiddleware, upload.single('logo'), uploadClubLogo);

// Update club
router.put('/:id', authMiddleware, updateClub);

// Delete club
router.delete('/:id', authMiddleware, deleteClub);

// Update club status
router.patch('/:id/status', authMiddleware, updateClubStatus);

// Disconnect gym from club
router.delete('/:id/gyms/:gymId', authMiddleware, disconnectGym);

export default router;