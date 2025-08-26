import { logger } from './logger';
import { Request, Response } from 'express';
import { RequestWithUser } from '../v1/types';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
  [key: string]: any;
}

interface ValidationError {
  field?: string;
  message: string;
  value?: any;
}

interface PaginationInfo {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface BackendResponse {
  data: any;
  status: number;
}

interface BackendError {
  type: 'HTTP_ERROR' | 'NETWORK_ERROR' | string;
  message: string;
  status?: number;
  data?: any;
}

/**
 * Standard API response formatter
 * Ensures consistent response structure across all endpoints
 */
class ResponseFormatter {
  /**
   * Success response
   * @param res - Express response object
   * @param data - Response data
   * @param message - Success message
   * @param statusCode - HTTP status code
   * @param meta - Additional metadata
   */
  static success(res: Response, data: any = null, message: string = 'Success', statusCode: number = 200, meta: Record<string, any> = {}): Response {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...meta
    };

    // Log successful responses (except health checks)
    if (!res.req.url.includes('/health')) {
      logger.info('API Success Response', {
        method: res.req.method,
        url: res.req.url,
        statusCode,
        message,
        dataType: data ? typeof data : 'null',
        userId: (res.req as RequestWithUser).user?.user_id || 'anonymous'
      });
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Error response
   * @param res - Express response object
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param error - Error details
   * @param meta - Additional metadata
   */
  static error(res: Response, message: string = 'Internal Server Error', statusCode: number = 500, error: any = null, meta: Record<string, any> = {}): Response {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      ...meta
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development' && error) {
      (response as any).error = error;
    }

    // Log error responses
    logger.error('API Error Response', {
      method: res.req.method,
      url: res.req.url,
      statusCode,
      message,
      error: error?.message || error,
      stack: error?.stack,
      userId: (res.req as RequestWithUser).user?.user_id || 'anonymous',
      body: res.req.body,
      params: res.req.params,
      query: res.req.query
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Validation error response
   * @param res - Express response object
   * @param errors - Validation errors
   * @param message - Error message
   */
  static validationError(res: Response, errors: ValidationError[] | ValidationError, message: string = 'Validation failed'): Response {
    const response = {
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors],
      timestamp: new Date().toISOString()
    };

    logger.warn('API Validation Error', {
      method: res.req.method,
      url: res.req.url,
      errors,
      body: res.req.body,
      userId: (res.req as RequestWithUser).user?.user_id || 'anonymous'
    });

    return res.status(400).json(response);
  }

  /**
   * Unauthorized response
   * @param res - Express response object
   * @param message - Error message
   */
  static unauthorized(res: Response, message: string = 'Unauthorized access'): Response {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response
   * @param res - Express response object
   * @param message - Error message
   */
  static forbidden(res: Response, message: string = 'Access forbidden'): Response {
    return this.error(res, message, 403);
  }

  /**
   * Not found response
   * @param res - Express response object
   * @param message - Error message
   */
  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  /**
   * Conflict response
   * @param res - Express response object
   * @param message - Error message
   */
  static conflict(res: Response, message: string = 'Resource conflict'): Response {
    return this.error(res, message, 409);
  }

  /**
   * Too many requests response
   * @param res - Express response object
   * @param message - Error message
   */
  static tooManyRequests(res: Response, message: string = 'Too many requests'): Response {
    return this.error(res, message, 429);
  }

  /**
   * Service unavailable response
   * @param res - Express response object
   * @param message - Error message
   */
  static serviceUnavailable(res: Response, message: string = 'Service temporarily unavailable'): Response {
    return this.error(res, message, 503);
  }

  /**
   * Created response
   * @param res - Express response object
   * @param data - Created resource data
   * @param message - Success message
   */
  static created(res: Response, data: any, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * No content response
   * @param res - Express response object
   */
  static noContent(res: Response): Response {
    logger.info('API No Content Response', {
      method: res.req.method,
      url: res.req.url,
      userId: (res.req as RequestWithUser).user?.user_id || 'anonymous'
    });

    return res.status(204).send();
  }

  /**
   * Paginated response
   * @param res - Express response object
   * @param data - Array of items
   * @param pagination - Pagination info
   * @param message - Success message
   */
  static paginated(res: Response, data: any[], pagination: PaginationInfo, message: string = 'Data retrieved successfully'): Response {
    const meta = {
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || data.length,
        totalPages: pagination.totalPages || Math.ceil((pagination.total || data.length) / (pagination.limit || 10)),
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false
      }
    };

    return this.success(res, data, message, 200, meta);
  }

  /**
   * Handle backend service response
   * @param res - Express response object
   * @param backendResponse - Response from backend service
   */
  static handleBackendResponse(res: Response, backendResponse: BackendResponse): Response {
    try {
      const { data, status } = backendResponse;
      
      // If backend returns structured response, use it
      if (data && typeof data === 'object' && 'success' in data) {
        return res.status(status).json({
          ...data,
          timestamp: new Date().toISOString()
        });
      }
      
      // Otherwise, wrap in standard format
      return this.success(res, data, 'Request completed successfully', status);
    } catch (error) {
      logger.error('Error handling backend response', { error: (error as Error).message });
      return this.error(res, 'Failed to process backend response', 500, error);
    }
  }

  /**
   * Handle backend service error
   * @param res - Express response object
   * @param backendError - Error from backend service
   */
  static handleBackendError(res: Response, backendError: BackendError): Response {
    try {
      if (backendError.type === 'HTTP_ERROR') {
        const message = backendError.data?.message || backendError.message;
        const statusCode = backendError.status || 500;
        return this.error(res, message, statusCode, backendError.data);
      }
      
      if (backendError.type === 'NETWORK_ERROR') {
        return this.serviceUnavailable(res, 'Backend service is currently unavailable');
      }
      
      return this.error(res, 'Backend service error', 500, backendError);
    } catch (error) {
      logger.error('Error handling backend error', { error: (error as Error).message });
      return this.error(res, 'Internal server error', 500);
    }
  }
}

export default ResponseFormatter;
export {
  ApiResponse,
  ValidationError,
  PaginationInfo,
  BackendResponse,
  BackendError
};