// Main types export file for the API Gateway
// This file serves as the central hub for all type definitions

// Export all common types
export * from './common';
export * from './api';

// Re-export commonly used types with shorter names for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  ValidationError,
  HealthCheckResponse,
  DetailedHealthResponse,
  RequestWithUser,
  JWTPayload,
  ThemeType,
  NodeEnvironment,
  HttpStatusCode,
  LogLevel,
  ApiError
} from './common';

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UpdateUserRequest,
  CreateUserRequest,
  ProfileResponse,
  UpdateProfileRequest,
  UserSettings,
  UpdateSettingsRequest,
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  Club,
  Gym,
  CreateClubRequest,
  UpdateClubRequest,
  FileUploadResponse,
  SearchParams,
  FilterParams,
  AnalyticsData,
  Notification,
  CreateNotificationRequest
} from './api';

// Export namespaces for organized imports
export { ApiTypes } from './common';
export { ApiEndpoints } from './api';

// Default export for the most commonly used types
export default {
  // Response types
  ApiResponse: {} as import('./common').ApiResponse,
  PaginatedResponse: {} as import('./common').PaginatedResponse<any>,
  
  // User types
  User: {} as import('./api').User,
  LoginRequest: {} as import('./api').LoginRequest,
  LoginResponse: {} as import('./api').LoginResponse,
  
  // Common types
  JWTPayload: {} as import('./common').JWTPayload,
  RequestWithUser: {} as import('./common').RequestWithUser,
  
  // Error types
  ValidationError: {} as import('./common').ValidationError,
  ApiError: {} as import('./common').ApiError
};

// Type guards and utility functions
export const isApiResponse = <T>(obj: any): obj is import('./common').ApiResponse<T> => {
  return obj && typeof obj === 'object' && typeof obj.success === 'boolean';
};

export const isPaginatedResponse = <T>(obj: any): obj is import('./common').PaginatedResponse<T> => {
  return isApiResponse(obj) && (obj as any).pagination && typeof (obj as any).pagination === 'object';
};

export const isValidationError = (obj: any): obj is import('./common').ValidationError => {
  return obj && typeof obj === 'object' && typeof obj.field === 'string' && typeof obj.message === 'string';
};

export const isApiError = (obj: any): obj is import('./common').ApiError => {
  return obj instanceof Error && ((obj as any).statusCode !== undefined || (obj as any).status !== undefined);
};

// Helper types for better development experience
export type ApiResponseSuccess<T> = import('./common').ApiResponse<T> & { success: true };
export type ApiResponseError = import('./common').ApiResponse & { success: false; error: any };

export type AuthenticatedRequest = import('./common').RequestWithUser;
export type ThemeUpdateRequest = import('./api').UpdateSettingsRequest & { theme: import('./common').ThemeType };

// Utility type for making all properties optional except specified ones
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Utility type for making all properties required except specified ones
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

// Database entity base type
export interface BaseEntity {
  created_at: string;
  updated_at: string;
}

// API endpoint response wrapper
export type EndpointResponse<T> = Promise<import('./common').ApiResponse<T>>;
export type PaginatedEndpointResponse<T> = Promise<import('./common').PaginatedResponse<T>>;

// Middleware types
export type MiddlewareFunction = (req: import('./common').RequestWithUser, res: import('express').Response, next: import('express').NextFunction) => void | Promise<void>;
export type ErrorMiddlewareFunction = (err: import('./common').ApiError, req: import('./common').RequestWithUser, res: import('express').Response, next: import('express').NextFunction) => void | Promise<void>;

// Route handler types
export type RouteHandler<TRequest = any, TResponse = any> = (
  req: import('./common').RequestWithUser & { body: TRequest },
  res: import('express').Response
) => Promise<void> | void;

export type AuthenticatedRouteHandler<TRequest = any, TResponse = any> = (
  req: import('./common').RequestWithUser & { body: TRequest; user: import('./common').JWTPayload },
  res: import('express').Response
) => Promise<void> | void;

// Configuration types
export interface ApiGatewayConfig {
  port: number;
  host: string;
  environment: import('./common').NodeEnvironment;
  backendUrl: string;
  jwtSecret: string;
  corsOrigins: string[];
  rateLimits: {
    api: number;
    auth: number;
    upload: number;
  };
  security: {
    helmet: boolean;
    https: boolean;
    trustProxy: boolean;
  };
  logging: {
    level: import('./common').LogLevel;
    file: boolean;
    console: boolean;
  };
  swagger: {
    enabled: boolean;
    path: string;
  };
}