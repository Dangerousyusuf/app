import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

// Types
export interface Club {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  gyms?: Gym[];
  users?: User[];
}

export interface Gym {
  id: string;
  name: string;
  description?: string;
  relationship_type?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

class ClubsService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/clubs`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const token = await AsyncStorage.getItem('userToken');
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

  async getAllClubs(): Promise<ApiResponse<Club[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulüpler getirilirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Kulüpler getirilirken hata:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Kulüpler getirilirken hata oluştu'
      };
    }
  }

  async getClubById(clubId: string): Promise<ApiResponse<Club>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${clubId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulüp getirilirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Kulüp getirilirken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Kulüp getirilirken hata oluştu'
      };
    }
  }
}

export default new ClubsService();