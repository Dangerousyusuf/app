import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../config/api';

// Types
export interface Permission {
  id: string;
  name: string;
  description?: string;
  module?: string;
  action?: string;
  resource?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePermissionData {
  name: string;
  description?: string;
  module?: string;
  action?: string;
  resource?: string;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
  module?: string;
  action?: string;
  resource?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

console.log('PermissionsService API_BASE_URL:', API_BASE_URL);

class PermissionsService {
  private baseURL: string;
  private api: AxiosInstance;

  constructor() {
    this.baseURL = `${API_BASE_URL}/permissions`;
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Test API connection
    this.api.get('/health').then(() => {
      console.log('PermissionsService API bağlantısı başarılı:', API_BASE_URL);
    }).catch((error) => {
      console.error('PermissionsService API bağlantı hatası:', error.message);
      console.error('PermissionsService API URL:', API_BASE_URL);
    });
  }

  // Tüm izinleri getir
  async getAllPermissions(token: string): Promise<ApiResponse<Permission[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Permission[]>> = await this.api.get('/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('İzinler getirme hatası:', error);
      throw error;
    }
  }

  // ID ile izin getir
  async getPermissionById(id: string, token: string): Promise<ApiResponse<Permission>> {
    try {
      const response: AxiosResponse<ApiResponse<Permission>> = await this.api.get(`/permissions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('İzin getirme hatası:', error);
      throw error;
    }
  }

  // Modüle göre izinleri getir
  async getPermissionsByModule(module: string, token: string): Promise<ApiResponse<Permission[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Permission[]>> = await this.api.get(`/permissions/module/${module}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Modül izinleri getirme hatası:', error);
      throw error;
    }
  }

  // Yeni izin oluştur
  async createPermission(permissionData: CreatePermissionData, token: string): Promise<ApiResponse<Permission>> {
    try {
      const response: AxiosResponse<ApiResponse<Permission>> = await this.api.post('/permissions', permissionData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('İzin oluşturma hatası:', error);
      throw error;
    }
  }

  // İzin güncelle
  async updatePermission(id: string, permissionData: UpdatePermissionData, token: string): Promise<ApiResponse<Permission>> {
    try {
      const response: AxiosResponse<ApiResponse<Permission>> = await this.api.put(`/permissions/${id}`, permissionData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('İzin güncelleme hatası:', error);
      throw error;
    }
  }

  // İzin sil
  async deletePermission(id: string, token: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.delete(`/permissions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('İzin silme hatası:', error);
      throw error;
    }
  }
}

export default new PermissionsService();