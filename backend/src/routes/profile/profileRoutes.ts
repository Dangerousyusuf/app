import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { getCurrentUser, uploadProfilePicture } from '../../controllers/profile/profileController';
import authMiddleware from '../../middlewares/authMiddleware';
import { AuthenticatedRequest } from '../../types/profile';

const router = express.Router();

// Profesyonel dosya yapısı için klasör oluşturma
const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req: AuthenticatedRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const uploadPath = path.join('uploads', 'images', 'avatars');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req: AuthenticatedRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // Dosya adını hash'leyerek benzersiz yap
    const hash = crypto.createHash('sha256');
    hash.update(Date.now().toString() + file.originalname + Math.random().toString());
    const hashedName = hash.digest('hex');
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, hashedName + extension);
  }
});

// Dosya filtreleme
const fileFilter = (req: AuthenticatedRequest, file: Express.Multer.File, cb: multer.FileFilterCallback): void => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir'));
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
// Get current user profile
router.get('/me', authMiddleware, getCurrentUser);

// Upload profile picture
router.post('/upload-picture', authMiddleware, upload.single('profileImage'), uploadProfilePicture);

export default router;