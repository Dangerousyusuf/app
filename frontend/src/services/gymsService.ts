import { API_BASE_URL } from '../config/api';
import authService from './authService';

// Types
export interface Gym {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  timezone?: string;
  is_public?: boolean;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
  clubs?: Club[];
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  relationship_type?: string;
}

export interface CreateGymData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UpdateGymData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  timezone?: string;
  is_public?: boolean;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

class GymsService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/gyms`;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Token alınırken hata:', error);
      throw new Error('Authentication required');
    }
  }

  async getAllGyms(): Promise<ApiResponse<Gym[]>> {
    try {
      console.log('getAllGyms çağrıldı, baseURL:', this.baseURL);
      const headers = await this.getAuthHeaders();
      console.log('Headers hazırlandı:', headers);
      
      console.log('Fetch isteği gönderiliyor...');
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers,
      });
      
      console.log('Response alındı, status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.log('Response başarısız, hata:', data.message);
        throw new Error(data.message || 'Salonlar yüklenirken hata oluştu');
      }

      console.log('Başarılı response, data.data:', data.data);
      return {
        success: true,
        data: data.data || [],
        message: data.message
      };
    } catch (error: any) {
      console.error('getAllGyms catch bloğu, hata:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Salonlar yüklenirken hata oluştu'
      };
    }
  }

  async getGymById(gymId: string): Promise<ApiResponse<Gym>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${gymId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Salon bilgileri yüklenirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Salon bilgileri yüklenirken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Salon bilgileri yüklenirken hata oluştu'
      };
    }
  }

  async createGym(gymData: CreateGymData): Promise<ApiResponse<Gym>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers,
        body: JSON.stringify(gymData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Salon oluşturulurken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Salon oluşturulurken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Salon oluşturulurken hata oluştu'
      };
    }
  }

  async updateGym(gymId: string, gymData: UpdateGymData): Promise<ApiResponse<Gym>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${gymId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(gymData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Salon güncellenirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Salon güncellenirken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Salon güncellenirken hata oluştu'
      };
    }
  }

  async deleteGym(gymId: string): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${gymId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Salon silinirken hata oluştu');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error: any) {
      console.error('Salon silinirken hata:', error);
      return {
        success: false,
        message: error.message || 'Salon silinirken hata oluştu'
      };
    }
  }

  async updateGymStatus(gymId: string, status: 'active' | 'inactive' | 'pending'): Promise<ApiResponse<Gym>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${gymId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Salon durumu güncellenirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Salon durumu güncellenirken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Salon durumu güncellenirken hata oluştu'
      };
    }
  }

  async addClubToGym(gymId: string, clubId: string, relationshipType: string): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${gymId}/clubs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          club_id: clubId,
          relationship_type: relationshipType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulüp eklenirken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Kulüp eklenirken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Kulüp eklenirken hata oluştu'
      };
    }
  }

  async removeClubFromGym(gymId: string, clubId: string): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseURL}/${gymId}/clubs/${clubId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulüp kaldırılırken hata oluştu');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      console.error('Kulüp kaldırılırken hata:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Kulüp kaldırılırken hata oluştu'
      };
    }
  }

  async getGymsByClubId(clubId: string): Promise<ApiResponse<Gym[]>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.getApiBaseUrl()}/clubs/${clubId}/gyms`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kulübe bağlı salonlar yüklenirken hata oluştu');
      }

      return {
        success: true,
        data: data.data || [],
        message: data.message || 'Kulübe bağlı salonlar başarıyla yüklendi'
      };
    } catch (error: any) {
      console.error('Get gyms by club id error:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Kulübe bağlı salonlar yüklenirken hata oluştu'
      };
    }
  }
}

export default new GymsService();