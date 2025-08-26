import path from 'path';
import dotenv from 'dotenv';
import { BACKEND_URLS, API_GATEWAY_URLS, urlUtils } from './urls';

// Load environment variables
dotenv.config({
  path: path.join(__dirname, '../../../.env')
});

// Type definitions
interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  API_VERSION: string;
  API_PREFIX: string;
  BACKEND_URL: string;
  BACKEND_TIMEOUT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGINS: string[];
  CORS_ALLOWLIST: string[];
  FORCE_HTTPS: boolean;
  TRUST_PROXY: boolean;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  AUTH_RATE_LIMIT_WINDOW_MS: number;
  AUTH_RATE_LIMIT_MAX_REQUESTS: number;
  UPLOAD_RATE_LIMIT_WINDOW_MS: number;
  UPLOAD_RATE_LIMIT_MAX_REQUESTS: number;
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  LOG_LEVEL: string;
  LOG_TO_FILE: boolean;
  LOG_DIR: string;
  REQUEST_TIMEOUT: number;
  BODY_LIMIT: string;
  SWAGGER_ENABLED: boolean;
  SWAGGER_PATH: string;
  HEALTH_CHECK_ENABLED: boolean;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
  isSwaggerEnabled(): boolean;
  getPort(): number;
  getHost(): string;
  getNodeEnv(): string;
  getApiVersion(): string;
  validate(): void;
  getApiUrl(): string;
  getBackendUrl(endpoint?: string): string;
}

const environment: EnvironmentConfig = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.API_PORT || '3000') || 3000,
  HOST: process.env.API_HOST || 'localhost',
  
  // API Configuration
  API_VERSION: process.env.API_VERSION || 'v1',
  API_PREFIX: process.env.API_PREFIX || '/api',
  
  // Backend Service Configuration
  get BACKEND_URL() {
    return process.env.BACKEND_URL || BACKEND_URLS.BASE;
  },
  BACKEND_TIMEOUT: parseInt(process.env.BACKEND_TIMEOUT || '30000') || 30000,
  
  // Security Configuration
  JWT_SECRET: (() => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required for security');
    }
    return jwtSecret;
  })(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS Configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
    urlUtils.getCorsOrigins(),
  CORS_ALLOWLIST: process.env.CORS_ALLOWLIST ? 
    process.env.CORS_ALLOWLIST.split(',').map(origin => origin.trim()) : 
    [],
  
  // HTTPS Configuration
  FORCE_HTTPS: process.env.FORCE_HTTPS === 'true',
  TRUST_PROXY: process.env.TRUST_PROXY !== 'false',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100') || 100,
  
  // Auth Rate Limiting
  AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000') || 15 * 60 * 1000,
  AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5') || 5,
  
  // Upload Rate Limiting
  UPLOAD_RATE_LIMIT_WINDOW_MS: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '3600000') || 60 * 60 * 1000, // 1 hour
  UPLOAD_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS || '10') || 10,
  
  // File Upload Configuration
  UPLOAD_PATH: process.env.UPLOAD_PATH || path.join(__dirname, '../../../uploads'),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880') || 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES ? 
    process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()) : 
    ['image/jpeg', 'image/jpg', 'image/png'],
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
  LOG_DIR: process.env.LOG_DIR || path.join(__dirname, '../logs'),
  
  // Request Configuration
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000') || 30000, // 30 seconds
  BODY_LIMIT: process.env.BODY_LIMIT || '10mb',
  
  // Swagger Configuration
  SWAGGER_ENABLED: process.env.SWAGGER_ENABLED !== 'false',
  SWAGGER_PATH: process.env.SWAGGER_PATH || '/api-docs',
  
  // Health Check Configuration
  HEALTH_CHECK_ENABLED: process.env.HEALTH_CHECK_ENABLED !== 'false',
  
  // Development Configuration
  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  },
  
  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },
  
  isTest(): boolean {
    return this.NODE_ENV === 'test';
  },

  isSwaggerEnabled(): boolean {
    return this.SWAGGER_ENABLED;
  },

  getPort(): number {
    return this.PORT;
  },

  getHost(): string {
    return this.HOST;
  },

  getNodeEnv(): string {
    return this.NODE_ENV;
  },

  getApiVersion(): string {
    return this.API_VERSION;
  },
  
  // Validation
  validate(): void {
    const required = ['JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (this.isProduction()) {
      const productionRequired = ['BACKEND_URL', 'CORS_ORIGINS'];
      const productionMissing = productionRequired.filter(key => !process.env[key]);
      
      if (productionMissing.length > 0) {
        throw new Error(`Missing required production environment variables: ${productionMissing.join(', ')}`);
      }
    }
  },
  
  // Get full API URL
  getApiUrl(): string {
    return process.env.NODE_ENV === 'production' ? 
      API_GATEWAY_URLS.PROD_BASE : 
      `http://${this.HOST}:${this.PORT}${this.API_PREFIX}/${this.API_VERSION}`;
  },
  
  // Get backend service URL
  getBackendUrl(endpoint: string = ''): string {
    return `${this.BACKEND_URL}${endpoint}`;
  }
};

// Validate environment on load
try {
  environment.validate();
} catch (error) {
  console.error('Environment validation failed:', (error as Error).message);
  if (environment.isProduction()) {
    process.exit(1);
  }
}

export default environment;