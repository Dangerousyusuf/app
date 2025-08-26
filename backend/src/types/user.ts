import { Request } from 'express';

// Ana User interface'i
export interface User {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  tc?: string;
  birth_date?: Date;
  role: string;
  profile_picture?: string;
  created_at: Date;
  updated_at: Date;
}

// User oluşturma için input tipi
export interface CreateUserInput {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  tc?: string;
  birth_date?: Date;
  role?: string;
}

// User güncelleme için input tipi
export interface UpdateUserInput {
  user_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  tc?: string;
  birth_date?: Date;
  role?: string;
}

// Role interface'i
export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at?: Date;
}

// Permission interface'i
export interface Permission {
  id: number;
  key: string;
  description: string;
  module: string;
}

// API Response tipi
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Pagination tipi
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Search response tipi
export interface UserSearchResponse {
  users: User[];
  pagination: PaginationInfo;
}

// Database query result interface
export interface DatabaseQueryResult<T> {
  rows: T[];
  rowCount: number;
}

// Authenticated Request tipi
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    user_id: number;
    email: string;
    role: string;
  };
}

// User Service Interface
export interface UserServiceInterface {
  getAllUsers(): Promise<User[]>;
  getUserById(userId: number): Promise<User | null>;
  updateUser(userId: number, updateData: UpdateUserInput): Promise<ApiResponse<User>>;
  deleteUser(userId: number): Promise<ApiResponse<any>>;
  searchUsers(query: string, page?: number, limit?: number): Promise<UserSearchResponse>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserRoles(userId: number): Promise<Role[]>;
  assignRoleToUser(userId: number, roleId: number): Promise<ApiResponse<any>>;
  removeRoleFromUser(userId: number, roleId: number): Promise<ApiResponse<any>>;
  updateUserRoles(userId: number, roleIds: number[]): Promise<ApiResponse<any>>;
  getUserPermissions(userId: number): Promise<ApiResponse<Permission[]>>;
  assignPermissionToUser(userId: number, permissionId: number): Promise<ApiResponse<any>>;
  removePermissionFromUser(userId: number, permissionId: number): Promise<ApiResponse<any>>;
  updateUserPermissions(userId: number, permissionIds: number[]): Promise<ApiResponse<any>>;
}