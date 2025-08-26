import { Request } from 'express';

export interface User {
  id: number;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: string;
  tc?: string;
  birth_date?: Date;
  role: string;
  profile_picture?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateProfilePictureResult {
  success: boolean;
  message: string;
  data: {
    profile_picture: string;
  };
}

export interface ProfileServiceInterface {
  getUserProfile(userId: number): Promise<User | null>;
  updateProfilePicture(userId: number, profilePicturePath: string): Promise<UpdateProfilePictureResult>;
}

// Express Request interface with user authentication
export interface AuthenticatedRequest extends Request {
  user: {
    user_id?: number;
    userId?: number;
  };
  file?: Express.Multer.File;
}

// Standard API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}