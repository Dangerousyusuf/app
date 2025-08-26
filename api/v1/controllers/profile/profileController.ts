import { Request, Response } from 'express';
import multer from 'multer';
import FormData from 'form-data';
import { getHttpClient } from '../../../utils/httpClient';
import ResponseFormatter from '../../../utils/responseFormatter';
import { logger } from '../../../utils/logger';
import { RequestWithUser } from '../../types';
import environment from '../../config/environment';
import path from 'path';
import fs from 'fs';

// Type definitions for profile requests
interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  birth_date?: string;
}

interface MulterRequest extends RequestWithUser {
  file?: Express.Multer.File;
}

// Multer configuration for file handling
const storage = multer.memoryStorage(); // Store in memory for forwarding

const upload = multer({
  storage: storage,
  limits: {
    fileSize: environment.MAX_FILE_SIZE
  },
  fileFilter: function (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (environment.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

const profileController = {
  // Get user profile
  getProfile: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user?.user_id;

      logger.info('Get profile request', {
        user_id: userId,
        ip: req.ip
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.getWithAuth('/profile/me', token || '');

      logger.info('Profile retrieved successfully', {
        user_id: userId
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Get profile failed', {
        error: (error as Error).message,
        user_id: req.user?.user_id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Update user profile
  updateProfile: async (req: RequestWithUser & { body: UpdateProfileRequest }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user?.user_id;
      const updateData = req.body;

      logger.info('Update profile request', {
        user_id: userId,
        fields: Object.keys(updateData),
        ip: req.ip
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.putWithAuth('/profile/update', updateData, token || '');

      logger.info('Profile updated successfully', {
        user_id: userId,
        fields: Object.keys(updateData)
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Update profile failed', {
        error: (error as Error).message,
        user_id: req.user?.user_id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (req: MulterRequest, res: Response): Promise<Response> => {
    return new Promise((resolve) => {
      // Handle file upload with multer
      upload.single('profileImage')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          logger.warn('File upload error', {
            error: err.message,
            user_id: req.user?.user_id,
            ip: req.ip
          });
          resolve(ResponseFormatter.validationError(res, [{ message: err.message, field: 'file' }]));
          return;
        } else if (err) {
          logger.warn('File validation error', {
            error: err.message,
            user_id: req.user?.user_id,
            ip: req.ip
          });
          resolve(ResponseFormatter.validationError(res, [{ message: err.message, field: 'file' }]));
          return;
        }

        if (!req.file) {
          resolve(ResponseFormatter.validationError(res, [{ message: 'Please select a profile picture', field: 'file' }]));
          return;
        }

        try {
          const token = req.headers.authorization?.replace('Bearer ', '');
          const userId = req.user?.user_id;

          logger.info('Profile picture upload request', {
            user_id: userId,
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            ip: req.ip
          });

          // Create FormData for file upload
          const formData = new FormData();
          formData.append('profileImage', req.file.buffer, req.file.originalname);

          // Forward file to backend service
          const httpClient = getHttpClient();
          const response = await httpClient.uploadFile('/profile/upload-picture', formData, token || '', {
            headers: {
              ...formData.getHeaders()
            }
          });

          logger.info('Profile picture uploaded successfully', {
            user_id: userId,
            filename: req.file.originalname
          });

          resolve(ResponseFormatter.handleBackendResponse(res, response));
        } catch (error) {
          logger.error('Profile picture upload failed', {
            error: (error as Error).message,
            user_id: req.user?.user_id,
            filename: req.file?.originalname,
            ip: req.ip
          });

          resolve(ResponseFormatter.handleBackendError(res, error as any));
        }
      });
    });
  },

  // Delete profile picture
  deleteProfilePicture: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user?.user_id;

      logger.info('Delete profile picture request', {
        user_id: userId,
        ip: req.ip
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.delete('/profile/delete-pic', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      logger.info('Profile picture deleted successfully', {
        user_id: userId
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Delete profile picture failed', {
        error: (error as Error).message,
        user_id: req.user?.user_id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  }
};

export default profileController;
export { upload };