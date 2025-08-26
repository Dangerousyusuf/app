import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/api';
import authService from './authService';

// Types
export interface Club {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  status?: 'active' | 'inactive' | 'pending';
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  gyms?: Gym[];
  owners?: ClubOwner[];
}

export interface Gym {
  id: string;
  name: string;
  description?: string;
  relationship_type?: string;
}

export interface ClubOwner {
  id: string;
  user_id: string;
  ownership_type?: string;
  ownership_percentage?: number;
}

export interface CreateClubData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UpdateClubData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  error?: string;
}

// API base URL - Merkezi konfigürasyondan alınır

// Axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

class ClubService {
  async getAllClubs(): Promise<ApiResponse<Club[]>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Club[]>> = await api.get('/clubs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0
      };
    } catch (error: any) {
      console.error('Get all clubs error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüpler getirilirken hata oluştu',
        error: error.message
      };
    }
  }

  async getClubById(clubId: string): Promise<ApiResponse<Club>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Club>> = await api.get(`/clubs/${clubId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get club by ID error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüp getirilirken hata oluştu',
        error: error.message
      };
    }
  }

  async createClub(clubData: CreateClubData): Promise<ApiResponse<Club>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Club>> = await api.post('/clubs', clubData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Create club error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüp oluşturulurken hata oluştu',
        error: error.message
      };
    }
  }

  async updateClub(clubId: string, clubData: UpdateClubData): Promise<ApiResponse<Club>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Club>> = await api.put(`/clubs/${clubId}`, clubData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update club error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüp güncellenirken hata oluştu',
        error: error.message
      };
    }
  }

  async deleteClub(clubId: string): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.delete(`/clubs/${clubId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Delete club error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüp silinirken hata oluştu',
        error: error.message
      };
    }
  }

  async updateClubStatus(clubId: string, status: 'active' | 'inactive' | 'pending'): Promise<ApiResponse<Club>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Club>> = await api.patch(`/clubs/${clubId}/status`, { status }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Update club status error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüp durumu güncellenirken hata oluştu',
        error: error.message
      };
    }
  }

  async uploadClubLogo(clubId: string, logoFile: File | Blob): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const formData = new FormData();
      formData.append('logo', logoFile);

      const response: AxiosResponse<ApiResponse> = await api.post(`/clubs/${clubId}/upload-logo`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 saniye timeout (dosya yükleme için)
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Upload club logo error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Logo yüklenirken hata oluştu'
      };
    }
  }

  async getClubGyms(clubId: string): Promise<ApiResponse<Gym[]>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Gym[]>> = await api.get(`/clubs/${clubId}/gyms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0
      };
    } catch (error: any) {
      console.error('Get club gyms error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüp salonları getirilirken hata oluştu',
        error: error.message
      };
    }
  }

  async getClubOwners(clubId: string): Promise<ApiResponse<ClubOwner[]>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<ClubOwner[]>> = await api.get(`/clubs/${clubId}/owners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data || [],
        count: response.data.count || 0
      };
    } catch (error: any) {
      console.error('Get club owners error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Kulüp sahipleri getirilirken hata oluştu',
        error: error.message
      };
    }
  }

  async connectGym(clubId: string, gymId: string, relationship: string): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.post(`/clubs/${clubId}/gyms`, {
        gymId,
        relationship
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Salon başarıyla bağlandı'
      };
    } catch (error: any) {
      console.error('Connect gym error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Salon bağlanırken hata oluştu',
        error: error.message
      };
    }
  }

  async disconnectGym(clubId: string, gymId: string): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.delete(`/clubs/${clubId}/gyms/${gymId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Salon başarıyla kaldırıldı'
      };
    } catch (error: any) {
      console.error('Disconnect gym error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || 'Salon kaldırılırken hata oluştu',
        error: error.message
      };
    }
  }
}

const clubService = new ClubService();
export default clubService;