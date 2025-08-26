export interface Club {
  id: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
  description?: string;
  logo?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface ClubCreateRequest {
  name: string;
  phone: string;
  email: string;
  address?: string;
  description?: string;
  logo?: string;
  status?: 'active' | 'inactive';
}

export interface ClubUpdateRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  logo?: string;
  status?: 'active' | 'inactive';
}

export interface ClubOwner {
  id: number;
  club_id: number;
  user_id: number;
  ownership_type: 'owner' | 'co_owner' | 'partner' | 'investor';
  ownership_percentage: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  // User bilgileri (JOIN ile gelen)
  user_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  profile_picture?: string;
}

export interface ClubOwnerCreateRequest {
  user_id: number;
  ownership_type?: 'owner' | 'co_owner' | 'partner' | 'investor';
  ownership_percentage?: number;
  start_date?: string;
}

export interface ClubOwnerUpdateRequest {
  ownership_type?: 'owner' | 'co_owner' | 'partner' | 'investor';
  ownership_percentage?: number;
}

export interface ClubGym {
  id: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
  description?: string;
  logo?: string;
  website?: string;
  capacity?: number;
  area_sqm?: number;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  relationship_type?: string;
}

export interface ClubStatusUpdateRequest {
  status: 'active' | 'inactive';
}