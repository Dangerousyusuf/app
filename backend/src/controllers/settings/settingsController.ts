import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../../types/auth';
import { settingsService } from '../../services/settings/settingsService';

// Tema güncelleme
const updateTheme = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { theme } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Kullanıcı kimliği bulunamadı'
      });
      return;
    }

    if (!theme || !['light', 'dark'].includes(theme)) {
      res.status(400).json({
        success: false,
        message: 'Geçerli bir tema seçin (light veya dark)'
      });
      return;
    }

    const result = await settingsService.updateUserTheme(userId, theme);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Tema güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Tema güncellenirken bir hata oluştu'
    });
  }
};

// Kullanıcı ayarlarını getir
const getUserSettings = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Kullanıcı kimliği bulunamadı'
      });
      return;
    }

    const result = await settingsService.getUserSettings(userId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Kullanıcı ayarları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı ayarları alınırken bir hata oluştu'
    });
  }
};

export {
  updateTheme,
  getUserSettings
};

export default {
  updateTheme,
  getUserSettings
};