import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse, User } from '../../types/profile';
import { profileService } from '../../services/profile';

const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.user_id || req.user.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Kullanıcı kimliği bulunamadı'
      } as ApiResponse);
      return;
    }

    const user = await profileService.getUserProfile(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: user
      }
    } as ApiResponse<{ user: User }>);
  } catch (error) {
    console.error('Get current user hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınırken hata oluştu'
    } as ApiResponse);
  }
};

const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.user_id || req.user.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Kullanıcı kimliği bulunamadı'
      } as ApiResponse);
      return;
    }
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Dosya yüklenmedi'
      } as ApiResponse);
      return;
    }

    const profilePictureName = req.file.filename;
    const result = await profileService.updateProfilePicture(userId, profilePictureName);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Upload profile picture hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Profil resmi yüklenirken hata oluştu'
    } as ApiResponse);
  }
};

export {
  getCurrentUser,
  uploadProfilePicture,
};

export default {
  getCurrentUser,
  uploadProfilePicture,
};