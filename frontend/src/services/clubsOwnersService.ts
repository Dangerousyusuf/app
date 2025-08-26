import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

// Types
export interface ClubOwner {
  id: string;
  user_id: string;
  club_id: string;
  ownership_type?: 'owner' | 'co-owner' | 'manager';
  ownership_percentage?: number;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface AddOwnerData {
  user_id: number;
  ownership_type?: 'owner' | 'co-owner' | 'manager';
  ownership_percentage?: number;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateOwnershipData {
  ownership_type?: 'owner' | 'co-owner' | 'manager';
  ownership_percentage?: number;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'inactive';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

class ClubsOwnersService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/clubs`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      // Geçici test token
      const authToken = token || 'test';
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      };
    } catch (error) {
      console.error('Token alınırken hata:', error);
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test',
      };
    }
  }

  // Kulübün sahiplerini getir
  async getClubOwners(clubId: string): Promise<ApiResponse<ClubOwner[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${clubId}/owners`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulüp sahipleri getirilirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
        count: data.count
      };
    } catch (error: any) {
      console.error('Kulüp sahipleri getirilirken hata:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Kulüp sahipleri getirilirken hata oluştu'
      };
    }
  }

  // Kulübe sahip ekle
  async addOwnerToClub(clubId: string, ownerData: AddOwnerData): Promise<ApiResponse<ClubOwner>> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${this.baseURL}/${clubId}/owners`;
      console.log('=== CLUBS OWNERS SERVICE DEBUG ===');
      console.log('Base URL:', this.baseURL);
      console.log('Full URL:', url);
      console.log('Headers:', headers);
      console.log('Data:', ownerData);
      console.log('=== FETCH İSTEĞİ BAŞLIYOR ===');
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(ownerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulübe sahip eklenirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Kulübe sahip eklenirken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Kulübe sahip eklenirken hata oluştu'
      };
    }
  }

  // Kulüpten sahip kaldır
  async removeOwnerFromClub(clubId: string, ownerId: string): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${clubId}/owners/${ownerId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulüpten sahip kaldırılırken hata oluştu');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error: any) {
      console.error('Kulüpten sahip kaldırılırken hata:', error);
      return {
        success: false,
        message: error.message || 'Kulüpten sahip kaldırılırken hata oluştu'
      };
    }
  }

  // Sahiplik bilgilerini güncelle
  async updateOwnership(clubId: string, ownerId: string, updateData: UpdateOwnershipData): Promise<ApiResponse<ClubOwner>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${clubId}/owners/${ownerId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sahiplik bilgileri güncellenirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Sahiplik bilgileri güncellenirken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Sahiplik bilgileri güncellenirken hata oluştu'
      };
    }
  }
}

export default new ClubsOwnersService();