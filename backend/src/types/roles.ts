import { Request } from 'express';

// Ana role interface'i
export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Create için input tipi
export interface CreateRoleInput {
  name: string;
  description?: string;
  permission_ids?: number[];
}

// Update için input tipi
export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

// Permission interface'i (roles ile ilişkili)
export interface Permission {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Role-Permission mapping
export interface RolePermissionMap {
  role_id: number;
  permission_id: number;
  created_at: Date;
}

// API Response tipi
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Authenticated Request tipi
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Role Service Interface
export interface RoleServiceInterface {
  getRoleById(id: number): Promise<Role | null>;
  createRole(data: CreateRoleInput): Promise<Role>;
  updateRole(id: number, data: UpdateRoleInput): Promise<Role | null>;
  deleteRole(id: number): Promise<boolean>;
  getRolePermissions(roleId: number): Promise<Permission[]>;
  updateRolePermissions(roleId: number, permissionIds: number[]): Promise<boolean>;
}

// Database query result types
export interface DatabaseQueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  oid: number;
  fields: any[];
}

// Role with permissions (joined data)
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

// Roles list response
export interface RolesListResponse {
  roles: Role[];
  total?: number;
  page?: number;
  limit?: number;
}

// Update role permissions input
export interface UpdateRolePermissionsInput {
  permission_ids: number[];
}