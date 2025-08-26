import { Request } from 'express';

// Permission Entity Types
export interface Permission {
  id: number;
  key: string;
  description: string;
  module: string;
  created_at: Date;
}

// Permission Creation Types
export interface CreatePermissionRequest {
  key: string;
  description: string;
  module: string;
}

export interface UpdatePermissionRequest {
  key: string;
  description: string;
  module: string;
}

// API Response Types
export interface PermissionResponse {
  success: boolean;
  message: string;
  data?: Permission;
  error?: string;
}

export interface PermissionsListResponse {
  success: boolean;
  message: string;
  data?: Permission[];
  count?: number;
  error?: string;
}

// Request Types with Authentication
export interface AuthenticatedPermissionRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  body: CreatePermissionRequest;
}

export interface AuthenticatedUpdatePermissionRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  params: {
    id: string;
  };
  body: UpdatePermissionRequest;
}

export interface AuthenticatedGetPermissionRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  params: {
    id: string;
  };
}

export interface AuthenticatedGetPermissionsByModuleRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
  params: {
    module: string;
  };
}

// Database Query Result Types
export interface PermissionQueryResult {
  rows: Permission[];
  rowCount: number;
}

export interface SinglePermissionQueryResult {
  rows: Permission[];
  rowCount: number;
}

// Validation Error Types
export interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: ValidationError[];
}

// Permission Module Constants
export const PERMISSION_MODULES = {
  USERS: 'users',
  GYMS: 'gyms',
  CLUBS: 'clubs',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  SETTINGS: 'settings',
  PROFILE: 'profile'
} as const;

export type PermissionModule = typeof PERMISSION_MODULES[keyof typeof PERMISSION_MODULES];

// Permission Action Constants
export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list'
} as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[keyof typeof PERMISSION_ACTIONS];