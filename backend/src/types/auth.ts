import { Request } from 'express';

// User entity interface
export interface User {
  user_id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  tc?: string;
  birth_date?: Date;
  role: string;
  profile_picture?: string;
  created_at: Date;
  updated_at: Date;
}

// Login input interface
export interface LoginInput {
  identifier: string; // email, user_name veya phone
  password: string;
}

// Register input interface
export interface RegisterInput {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  tc?: string;
  birth_date?: string;
  role?: string;
}

// User response interface (şifre olmadan)
export interface UserResponse {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender?: string;
  role: string;
  profile_picture?: string;
}

// Auth response interface
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserResponse;
    token: string;
  };
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Authenticated Request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Auth Service Interface
export interface AuthServiceInterface {
  authenticateUser(identifier: string, password: string): Promise<AuthResponse>;
  registerUser(userData: RegisterInput): Promise<AuthResponse>;
  getUserById(userId: number): Promise<ApiResponse<{ user: UserResponse }>>;
}

// Database query result interface
export interface DatabaseQueryResult {
  rows: any[];
  rowCount: number;
}

// JWT Payload interface
export interface JWTPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

// Request body types for controllers
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  tc?: string;
  birth_date?: string;
  role?: string;
}