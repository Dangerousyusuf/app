import ResponseFormatter from '../../utils/responseFormatter';
import { logger } from '../../utils/logger';
import environment from '../config/environment';
import { Request, Response, NextFunction } from 'express';

// Type definitions for error handling
interface CustomError extends Error {
  statusCode?: number;
  status?: number;
  code?: string | number;
  keyValue?: Record<string, any>;
  errors?: Record<string, any>;
  isAxiosError?: boolean;
  response?: {
    status: number;
    data?: any;
  };
  request?: any;
}

interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    [key: string]: any;
  };
}

/**
 * Global error handling middleware for API Gateway
 * Handles various types of errors and formats them consistently
 */
const errorHandler = (err: CustomError, req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  // Log the error
  logger.error('Unhandled error in API Gateway', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.user_id || 'anonymous',
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Handle specific error types
  
  // Validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors!).map((error: any) => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return ResponseFormatter.validationError(res, errors, 'Validation failed');
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    const value = field ? (err.keyValue as any)[field] : 'unknown';
    
    return ResponseFormatter.conflict(res, `${field} '${value}' already exists`);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseFormatter.unauthorized(res, 'Invalid authentication token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return ResponseFormatter.unauthorized(res, 'Authentication token has expired');
  }
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ResponseFormatter.error(res, 'File size too large', 400);
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return ResponseFormatter.error(res, 'Too many files uploaded', 400);
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return ResponseFormatter.error(res, 'Unexpected file field', 400);
  }
  
  // Rate limiting errors
  if (err.status === 429) {
    return ResponseFormatter.tooManyRequests(res, 'Too many requests, please try again later');
  }
  
  // Axios/HTTP client errors (from backend service)
  if (err.isAxiosError) {
    if (err.response) {
      // Backend service returned an error response
      const { status, data } = err.response;
      const message = data?.message || 'Backend service error';
      
      return ResponseFormatter.error(res, message, status, environment.isDevelopment() ? data : null);
    } else if (err.request) {
      // Network error - backend service is unreachable
      return ResponseFormatter.serviceUnavailable(res, 'Backend service is currently unavailable');
    }
  }
  
  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return ResponseFormatter.forbidden(res, 'CORS policy violation');
  }
  
  // Timeout errors
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    return ResponseFormatter.error(res, 'Request timeout', 408);
  }
  
  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    return ResponseFormatter.serviceUnavailable(res, 'Database service is currently unavailable');
  }
  
  // Syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ResponseFormatter.error(res, 'Invalid JSON in request body', 400);
  }
  
  // Custom API errors with status codes
  if (err.statusCode || err.status) {
    const statusCode = err.statusCode || err.status;
    const message = err.message || 'An error occurred';
    
    return ResponseFormatter.error(res, message, statusCode, environment.isDevelopment() ? err : null);
  }
  
  // Default internal server error
  const message = environment.isDevelopment() ? err.message : 'Internal server error';
  const errorDetails = environment.isDevelopment() ? {
    message: err.message,
    stack: err.stack,
    name: err.name
  } : null;
  
  return ResponseFormatter.error(res, message, 500, errorDetails);
};

/**
 * 404 Not Found handler
 * This should be the last middleware before error handler
 */
const notFoundHandler = (req: Request, res: Response, next: NextFunction): Response => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  return ResponseFormatter.notFound(res, `Route ${req.method} ${req.url} not found`);
};

/**
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = <T extends Request = Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {
  errorHandler,
  notFoundHandler,
  asyncHandler
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler
};