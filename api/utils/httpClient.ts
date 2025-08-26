import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import FormData from 'form-data';
import environment from '../v1/config/environment';
import { logger } from './logger';
import { Request, Response } from 'express';

interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface RequestMetadata {
  requestId: string;
  startTime: number;
}

interface HealthCheckResult {
  healthy: boolean;
  status?: number;
  data?: any;
  error?: string;
  type?: string;
}

interface HttpError {
  type: 'HTTP_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'REQUEST_ERROR';
  message: string;
  status?: number;
  data?: any;
  originalError?: any;
  headers?: any;
  timeout?: boolean;
  code?: string;
}

class HttpClient {
  private client: AxiosInstance;
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(options: HttpClientOptions = {}) {
    this.baseURL = options.baseURL || environment.getBackendUrl();
    this.timeout = options.timeout || environment.BACKEND_TIMEOUT;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Gateway/1.0.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: any) => {
        const requestId = this.generateRequestId();
        config.metadata = { requestId, startTime: Date.now() } as RequestMetadata;
        
        logger.debug('HTTP Request', {
          requestId,
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          headers: this.sanitizeHeaders(config.headers)
        });
        
        return config;
      },
      (error) => {
        logger.error('HTTP Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const { requestId, startTime } = (response.config as any).metadata || {};
        const duration = Date.now() - startTime;
        
        logger.debug('HTTP Response', {
          requestId,
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          dataSize: JSON.stringify(response.data).length
        });
        
        return response;
      },
      (error) => {
        const { requestId, startTime } = error.config?.metadata || {};
        const duration = startTime ? Date.now() - startTime : 0;
        
        logger.error('HTTP Response Error', {
          requestId,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          duration: `${duration}ms`,
          url: error.config?.url
        });
        
        return Promise.reject(this.handleError(error));
      }
    );
  }
  
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  private handleError(error: AxiosError): HttpError {
    if (error.response) {
      // Server responded with error status
      return {
        type: 'HTTP_ERROR',
        status: error.response.status,
        message: (error.response.data as any)?.message || error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        type: 'NETWORK_ERROR',
        message: 'No response received from backend service',
        timeout: error.code === 'ECONNABORTED',
        code: error.code
      };
    } else {
      // Something else happened
      return {
        type: 'REQUEST_ERROR',
        message: error.message
      };
    }
  }
  
  private async retryRequest<T>(requestFn: () => Promise<AxiosResponse<T>>, retries: number = this.retries): Promise<AxiosResponse<T>> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        // Don't retry on client errors (4xx)
        if ((error as any).status >= 400 && (error as any).status < 500) {
          throw error;
        }
        
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt}/${retries})`, {
          error: (error as Error).message,
          attempt,
          delay
        });
        
        await this.sleep(delay);
      }
    }
    throw new Error('Retry attempts exhausted');
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // HTTP Methods
  async get<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.retryRequest(() => this.client.get<T>(url, config));
  }
  
  async post<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.retryRequest(() => this.client.post<T>(url, data, config));
  }
  
  async put<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.retryRequest(() => this.client.put<T>(url, data, config));
  }
  
  async patch<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.retryRequest(() => this.client.patch<T>(url, data, config));
  }
  
  async delete<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.retryRequest(() => this.client.delete<T>(url, config));
  }
  
  // Convenience methods for common patterns
  async getWithAuth<T = any>(url: string, token: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.get<T>(url, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  async postWithAuth<T = any>(url: string, data: any, token: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.post<T>(url, data, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  async putWithAuth<T = any>(url: string, data: any, token: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.put<T>(url, data, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  async deleteWithAuth<T = any>(url: string, token: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.delete<T>(url, {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  async uploadFile<T = any>(url: string, formData: FormData, token: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.post<T>(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Health check
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const response = await this.get('/health', { timeout: 5000 });
      return {
        healthy: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        healthy: false,
        error: (error as Error).message,
        type: (error as any).type
      };
    }
  }
}

// Create default instance lazily
let httpClientInstance: HttpClient | null = null;

function getHttpClient(): HttpClient {
  if (!httpClientInstance) {
    httpClientInstance = new HttpClient();
  }
  return httpClientInstance;
}

// Reset the instance (useful for testing or environment changes)
function resetHttpClient(): void {
  httpClientInstance = null;
}

// Proxy request function for API Gateway
async function proxyRequest(req: Request, res: Response, targetUrl: string): Promise<void> {
  try {
    const httpClient = getHttpClient();
    const method = req.method.toLowerCase();
    
    // Prepare request config
    const config = {
      headers: {
        ...req.headers,
        host: undefined, // Remove host header to avoid conflicts
        'content-length': undefined, // Let axios handle content-length
        'if-none-match': undefined, // Remove cache headers to avoid 304
        'if-modified-since': undefined // Remove cache headers to avoid 304
      },
      params: req.query
    };
    
    // Add authorization header if present
    if (req.headers.authorization) {
      config.headers.authorization = req.headers.authorization;
    }
    
    // Make request based on method
    let response: AxiosResponse<any>;
    
    switch (method) {
      case 'get':
        response = await httpClient.get(targetUrl, config);
        break;
      case 'post':
        response = await httpClient.post(targetUrl, req.body, config);
        break;
      case 'put':
        response = await httpClient.put(targetUrl, req.body, config);
        break;
      case 'patch':
        response = await httpClient.patch(targetUrl, req.body, config);
        break;
      case 'delete':
        response = await httpClient.delete(targetUrl, config);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    // Forward response
    res.status(response.status);
    
    // Forward response headers (excluding some that shouldn't be forwarded)
    const excludeHeaders = ['content-encoding', 'content-length', 'transfer-encoding'];
    Object.keys(response.headers).forEach(key => {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        res.set(key, response.headers[key]);
      }
    });
    
    res.json(response.data);
    
  } catch (error) {
    logger.error('Proxy request failed', {
      targetUrl,
      method: req.method,
      error: (error as Error).message,
      status: (error as any).response?.status
    });
    
    // Forward error response if available
    if ((error as any).response) {
      res.status((error as any).response.status).json((error as any).response.data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Proxy request failed',
        error: (error as Error).message
      });
    }
  }
}

export {
  HttpClient,
  getHttpClient,
  resetHttpClient,
  proxyRequest,
  HttpClientOptions,
  HealthCheckResult,
  HttpError
};