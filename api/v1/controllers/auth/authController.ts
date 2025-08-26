import { Request, Response } from 'express';
import { getHttpClient } from '../../../utils/httpClient';
import ResponseFormatter from '../../../utils/responseFormatter';
import { logger } from '../../../utils/logger';
import { RequestWithUser } from '../../types';

// Type definitions for auth requests
interface RegisterRequest {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
}

interface LoginRequest {
  identifier: string;
  password: string;
}

interface RefreshTokenRequest {
  refresh_token: string;
}

const authController = {
  // User registration
  register: async (req: Request & { body: RegisterRequest }, res: Response): Promise<Response> => {
    try {
      const { user_name, first_name, last_name, email, password, phone } = req.body;

      logger.info('User registration attempt', {
        user_name,
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.post('/auth/register', {
        user_name,
        first_name,
        last_name,
        email,
        password,
        phone
      });

      logger.info('User registration successful', {
        user_id: response.data.user?.user_id,
        user_name: response.data.user?.user_name,
        email: response.data.user?.email
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('User registration failed', {
        error: (error as Error).message,
        user_name: req.body.user_name,
        email: req.body.email,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // User login
  login: async (req: Request & { body: LoginRequest }, res: Response): Promise<Response> => {
    try {
      const { identifier, password } = req.body;

      logger.info('User login attempt', {
        identifier,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.post('/auth/login', {
        identifier,
        password
      });

      logger.info('User login successful', {
        user_id: response.data.user?.user_id,
        user_name: response.data.user?.user_name,
        email: response.data.user?.email
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.warn('User login failed', {
        error: (error as Error).message,
        user_name: req.body.user_name,
        ip: req.ip,
        type: (error as any).type,
        status: (error as any).status
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Refresh token (if implemented in backend)
  refreshToken: async (req: Request & { body: RefreshTokenRequest }, res: Response): Promise<Response> => {
    try {
      const { refreshToken } = req.body;

      logger.info('Token refresh attempt', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const httpClient = getHttpClient();
      const response = await httpClient.post('/auth/refresh', {
        refreshToken
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.warn('Token refresh failed', {
        error: (error as Error).message,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Logout (if implemented in backend)
  logout: async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      logger.info('User logout attempt', {
        user_id: req.user?.user_id,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.post('/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      logger.info('User logout successful', {
        user_id: req.user?.user_id
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.warn('User logout failed', {
        error: (error as Error).message,
        user_id: req.user?.user_id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  }
};

export default authController;