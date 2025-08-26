// Common types and interfaces used across the API Gateway
import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface HealthCheckResponse {
  status: 'OK' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: Record<string, string>;
  memory: {
    used: string;
    total: string;
  };
}

export interface DetailedHealthResponse extends HealthCheckResponse {
  config: {
    port: number;
    host: string;
    backendUrl: string;
    corsOrigins: string[];
    rateLimiting: {
      api: number;
      auth: number;
      upload: number;
    };
  };
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
  };
}

// HTTP Status Codes
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// Environment types
export type NodeEnvironment = 'development' | 'production' | 'test';

// Request types
export interface RequestWithUser extends Request {
  user?: {
    user_id: string;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

// Logging types
export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Configuration types
export interface CorsConfig {
  origin: string | string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge?: number;
}

export interface SecurityConfig {
  helmet: Record<string, any>;
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };
  cors: CorsConfig;
}

// Database/Backend service types
export interface BackendServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// JWT types
export interface JWTPayload {
  user_id: string;
  name: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Theme types
export type ThemeType = 'light' | 'dark' | 'system';

export interface ThemeUpdateRequest {
  theme: ThemeType;
}

// Generic utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API Gateway specific types
export interface ProxyRequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
}

export interface ProxyResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Error types
export interface ApiError extends Error {
  statusCode?: number;
  status?: number;
  code?: string | number;
  details?: any;
  isOperational?: boolean;
}

export interface ValidationErrorDetails {
  errors: ValidationError[];
  message: string;
}

// Middleware types
export interface MiddlewareOptions {
  skip?: (req: any) => boolean;
  onLimitReached?: (req: any, res: any) => void;
  keyGenerator?: (req: any) => string;
}

// Export all types as a namespace for easier importing
export namespace ApiTypes {
  export type Response<T = any> = ApiResponse<T>;
  export type PaginatedResponseType<T> = PaginatedResponse<T>;
  export type ValidationErrorType = ValidationError;
  export type HealthCheck = HealthCheckResponse;
  export type DetailedHealthCheck = DetailedHealthResponse;
  export type RequestWithUserType = RequestWithUser;
  export type UploadedFileType = UploadedFile;
  export type LogContextType = LogContext;
  export type JWTPayloadType = JWTPayload;
  export type ThemeTypeEnum = ThemeType;
  export type NodeEnvironmentType = NodeEnvironment;
  export type ApiErrorType = ApiError;
}