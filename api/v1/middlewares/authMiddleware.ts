import jwt from 'jsonwebtoken';
import ResponseFormatter from '../../utils/responseFormatter';
import { logger } from '../../utils/logger';
import environment from '../config/environment';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    user_name: string;
    email: string;
    role: string;
  } | null;
  token?: string | null;
}

interface JWTPayload {
  user_id?: string;
  userId?: string;
  user_name: string;
  email: string;
  role?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method
      });
      
      ResponseFormatter.unauthorized(res, 'Access denied. No token provided.');
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Authentication failed: Empty token', {
        ip: req.ip,
        url: req.url,
        method: req.method
      });
      
      ResponseFormatter.unauthorized(res, 'Access denied. Invalid token format.');
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, environment.JWT_SECRET) as JWTPayload;
    
    // Add user info to request object
    req.user = {
      user_id: (decoded.user_id || decoded.userId) || '',
      user_name: decoded.user_name,
      email: decoded.email,
      role: decoded.role || 'user'
    };
    
    // Add token to request for forwarding
    req.token = token;
    
    logger.debug('Authentication successful', {
      user_id: decoded.user_id,
      user_name: decoded.user_name,
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    next();
  } catch (error) {
    logger.warn('Authentication failed: Invalid token', {
      error: (error as Error).message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    if ((error as Error).name === 'TokenExpiredError') {
      ResponseFormatter.unauthorized(res, 'Token has expired. Please login again.');
      return;
    } else if ((error as Error).name === 'JsonWebTokenError') {
      ResponseFormatter.unauthorized(res, 'Invalid token. Please login again.');
      return;
    } else {
      ResponseFormatter.unauthorized(res, 'Authentication failed.');
      return;
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      req.token = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      req.token = null;
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(token, environment.JWT_SECRET) as JWTPayload;
    
    req.user = {
      user_id: decoded.user_id || '',
      user_name: decoded.user_name,
      email: decoded.email,
      role: decoded.role || 'user'
    };
    
    req.token = token;
    
    logger.debug('Optional authentication successful', {
      user_id: decoded.user_id,
      user_name: decoded.user_name,
      ip: req.ip
    });
    
    next();
  } catch (error) {
    // Token is invalid, but continue without authentication
    logger.debug('Optional authentication failed, continuing without auth', {
      error: (error as Error).message,
      ip: req.ip
    });
    
    req.user = null;
    req.token = null;
    next();
  }
};

// Admin role check middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    ResponseFormatter.unauthorized(res, 'Authentication required.');
    return;
  }
  
  if (req.user.role !== 'admin') {
    logger.warn('Admin access denied', {
      user_id: req.user.user_id,
      user_role: req.user.role,
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    ResponseFormatter.forbidden(res, 'Admin access required.');
    return;
  }
  
  logger.debug('Admin access granted', {
    user_id: req.user.user_id,
    ip: req.ip,
    url: req.url
  });
  
  next();
};

// Self or admin access middleware
const requireSelfOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    ResponseFormatter.unauthorized(res, 'Authentication required.');
    return;
  }
  
  // Rol sistemi henüz aktif değil, sadece authentication kontrolü yap
  logger.info('User access granted (role system disabled)', {
    user_id: req.user.user_id,
    target_user_id: req.params.id || req.params.user_id,
    user_role: req.user.role,
    ip: req.ip,
    url: req.url
  });
  
  next();
};

export {
  authMiddleware,
  authMiddleware as requireAuth,
  optionalAuth,
  requireAdmin,
  requireSelfOrAdmin
};

export default authMiddleware;