import express, { Response } from 'express';
import { getHttpClient } from '../../utils/httpClient';
const httpClient = getHttpClient();
import { authMiddleware } from '../middlewares/authMiddleware';
import { logger } from '../../utils/logger';
import { RequestWithUser } from '../types/common';
import { urlUtils } from '../config/urls';

interface ThemeRequest extends RequestWithUser {
  body: {
    theme: string;
  };
}

const router = express.Router();

// Update user theme
router.put('/theme', authMiddleware, async (req: ThemeRequest, res: Response): Promise<Response> => {
  try {
    const { theme } = req.body;
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı doğrulaması gerekli'
      });
    }
    const userId = req.user.user_id;

    logger.info('Update theme request', {
      userId,
      theme,
      ip: req.ip
    });

    // Validation
    if (!theme) {
      return res.status(400).json({
        success: false,
        message: 'Tema değeri gereklidir'
      });
    }

    // Valid theme values
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tema değeri. Geçerli değerler: light, dark, auto'
      });
    }

    // Forward request to backend
    const response = await httpClient.put(
      urlUtils.getBackendApiUrl(`/users/${userId}/theme`),
      { theme },
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );

    logger.info('Theme updated successfully', {
      userId,
      theme
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    logger.error('Update theme error', {
      error: error.message,
      userId: req.user?.user_id,
      ip: req.ip
    });

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      message: 'Tema güncellenirken bir hata oluştu'
    });
  }
});

// Get user settings
router.get('/', authMiddleware, async (req: RequestWithUser, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı doğrulaması gerekli'
      });
    }
    const userId = req.user.user_id;

    logger.info('Get user settings request', {
      userId,
      ip: req.ip
    });

    // Forward request to backend
    const response = await httpClient.get(
      '/settings',
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );

    logger.info('User settings retrieved successfully', {
      userId
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    logger.error('Get user settings error', {
      error: error.message,
      userId: req.user?.user_id,
      ip: req.ip
    });

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      message: 'Kullanıcı ayarları alınırken bir hata oluştu'
    });
  }
});

export default router;