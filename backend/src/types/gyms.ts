import { Request } from 'express';

// Ana Gym interface'i
export interface Gym {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  timezone?: string;
  is_public: boolean;
  description?: string;
  logo?: string;
  website?: string;
  capacity?: number;
  area_sqm?: number;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: Date;
  updated_at: Date;
  clubs?: ClubRelation[];
}

// Club ilişki bilgisi
export interface ClubRelation {
  id?: number;
  club_id: number;
  club_name: string;
  name?: string; // Alternatif isim alanı
  relationship_type: 'ownership' | 'partnership' | 'franchise';
}

// Gym oluşturma için input tipi
export interface CreateGymInput {
  club_id?: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  timezone?: string;
  is_public?: boolean;
  description?: string;
  website?: string;
  capacity?: number;
  area_sqm?: number;
  latitude?: number;
  longitude?: number;
  status?: 'active' | 'inactive' | 'maintenance';
}

// Gym güncelleme için input tipi
export interface UpdateGymInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  timezone?: string;
  is_public?: boolean;
  description?: string;
  website?: string;
  capacity?: number;
  area_sqm?: number;
  latitude?: number;
  longitude?: number;
  status?: 'active' | 'inactive' | 'maintenance';
}

// Gym status güncelleme için input tipi
export interface UpdateGymStatusInput {
  status: 'active' | 'inactive' | 'maintenance';
}

// Club-Gym ilişkisi ekleme için input tipi
export interface AddClubToGymInput {
  club_id: number;
  relationship_type: 'ownership' | 'partnership' | 'franchise';
}

// API Response tipi
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  count?: number;
  error?: string;
}

// Authenticated Request tipi (file upload desteği ile)
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
  file?: Express.Multer.File;
}

// Database query result tipi
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  oid: number;
  fields: any[];
}

// Gym Service Interface
export interface GymServiceInterface {
  getAllGyms(): Promise<Gym[]>;
  getGymById(id: number): Promise<Gym | null>;
  createGym(data: CreateGymInput, logoPath?: string): Promise<Gym>;
  updateGym(id: number, data: UpdateGymInput, logoPath?: string): Promise<Gym | null>;
  deleteGym(id: number): Promise<boolean>;
  updateGymStatus(id: number, status: 'active' | 'inactive' | 'maintenance'): Promise<Gym | null>;
  addClubToGym(gymId: number, clubId: number, relationshipType: 'ownership' | 'partnership' | 'franchise'): Promise<any>;
  removeClubFromGym(gymId: number, clubId: number): Promise<boolean>;
}

// Validation error tipi
export interface ValidationError {
  type: string;
  value: any;
  msg: string;
  path: string;
  location: string;
}

// Express-validator result tipi
export interface ValidationResult {
  isEmpty(): boolean;
  array(): ValidationError[];
}

// Multer file tipi
export interface MulterFile {
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

// Gym controller fonksiyon tipleri
export type GymControllerFunction = (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next?: NextFunction
) => Promise<void>;

// Response tipi import
import { Response, NextFunction } from 'express';

// Export all types
export {
  Response,
  NextFunction
};