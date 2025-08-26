// API endpoint specific types and interfaces

import { ApiResponse, PaginatedResponse, ThemeType } from './common';

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
    theme?: ThemeType;
    created_at: string;
    updated_at: string;
  };
  expires_in: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expires_in: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User related types
export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  theme: ThemeType;
  profile_image?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  country?: string;
}

export interface UserListResponse extends PaginatedResponse<User> {}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}

// Profile related types
export interface ProfileResponse {
  user: User;
  stats?: {
    total_workouts?: number;
    total_clubs?: number;
    member_since: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  country?: string;
}

export interface UploadProfileImageRequest {
  image: File | Buffer;
}

// Settings related types
export interface UserSettings {
  theme: ThemeType;
  notifications: {
    email: boolean;
    push: boolean;
    workout_reminders: boolean;
    club_updates: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'private' | 'friends';
    workout_visibility: 'public' | 'private' | 'friends';
  };
  preferences: {
    language: string;
    timezone: string;
    date_format: string;
    measurement_unit: 'metric' | 'imperial';
  };
}

export interface UpdateSettingsRequest {
  theme?: ThemeType;
  notifications?: Partial<UserSettings['notifications']>;
  privacy?: Partial<UserSettings['privacy']>;
  preferences?: Partial<UserSettings['preferences']>;
}

// Role and Permission types
export interface Role {
  role_id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  permission_id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[]; // Array of permission IDs
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
}

// Club related types (proxy to backend)
export interface Club {
  club_id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  cover_image?: string;
  amenities: string[];
  operating_hours: {
    [day: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  membership_plans: MembershipPlan[];
  rating: number;
  total_reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlan {
  plan_id: string;
  name: string;
  description: string;
  price: number;
  duration_months: number;
  features: string[];
  is_active: boolean;
}

export interface CreateClubRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  amenities: string[];
  operating_hours: Club['operating_hours'];
}

export interface UpdateClubRequest extends Partial<CreateClubRequest> {
  is_active?: boolean;
}

// Gym related types (proxy to backend)
export interface Gym {
  gym_id: string;
  club_id: string;
  name: string;
  description: string;
  floor: number;
  capacity: number;
  equipment: Equipment[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  equipment_id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  last_maintenance: string;
  is_active: boolean;
}

export interface CreateGymRequest {
  club_id: string;
  name: string;
  description: string;
  floor: number;
  capacity: number;
}

export interface UpdateGymRequest extends Partial<CreateGymRequest> {
  is_active?: boolean;
}

// File upload types
export interface FileUploadResponse {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
}

export interface MultipleFileUploadResponse {
  files: FileUploadResponse[];
  total: number;
}

// Search and filter types
export interface SearchParams {
  q?: string;
  category?: string;
  location?: string;
  radius?: number;
  min_price?: number;
  max_price?: number;
  rating?: number;
  amenities?: string[];
}

export interface FilterParams {
  status?: 'active' | 'inactive' | 'all';
  role?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
}

// Analytics and reporting types
export interface AnalyticsData {
  period: string;
  metrics: {
    total_users: number;
    active_users: number;
    new_registrations: number;
    total_clubs: number;
    total_workouts: number;
    revenue: number;
  };
  trends: {
    user_growth: number;
    club_growth: number;
    revenue_growth: number;
  };
}

// Notification types
export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface CreateNotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: Notification['type'];
  expires_at?: string;
}

// Export all API types as a namespace
export namespace ApiEndpoints {
  // Auth
  export type LoginRequestType = LoginRequest;
  export type LoginResponseType = LoginResponse;
  export type RegisterRequestType = RegisterRequest;
  export type RegisterResponseType = RegisterResponse;
  
  // User
  export type UserType = User;
  export type UpdateUserRequestType = UpdateUserRequest;
  export type CreateUserRequestType = CreateUserRequest;
  
  // Profile
  export type ProfileResponseType = ProfileResponse;
  export type UpdateProfileRequestType = UpdateProfileRequest;
  
  // Settings
  export type UserSettingsType = UserSettings;
  export type UpdateSettingsRequestType = UpdateSettingsRequest;
  
  // Roles & Permissions
  export type RoleType = Role;
  export type PermissionType = Permission;
  export type CreateRoleRequestType = CreateRoleRequest;
  
  // Clubs & Gyms
  export type ClubType = Club;
  export type GymType = Gym;
  export type CreateClubRequestType = CreateClubRequest;
  
  // Files
  export type FileUploadResponseType = FileUploadResponse;
  
  // Search & Analytics
  export type SearchParamsType = SearchParams;
  export type AnalyticsDataType = AnalyticsData;
}