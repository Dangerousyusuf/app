import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/api';
import authService from './authService';

// Types
export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
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

class RoleService {
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Role[]>> = await api.get('/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Roller getirme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async getRoleById(roleId: string): Promise<ApiResponse<Role>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Role>> = await api.get(`/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Rol getirme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async createRole(roleData: CreateRoleData): Promise<ApiResponse<Role>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Role>> = await api.post('/roles', roleData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Rol oluşturma hatası:', error);
      throw error.response?.data || error;
    }
  }

  async updateRole(roleId: string, roleData: UpdateRoleData): Promise<ApiResponse<Role>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Role>> = await api.put(`/roles/${roleId}`, roleData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Rol güncelleme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async deleteRole(roleId: string): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.delete(`/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Rol silme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async getRolePermissions(roleId: string): Promise<ApiResponse<Permission[]>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Permission[]>> = await api.get(`/roles/${roleId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Rol izinleri getirme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.put(`/roles/${roleId}/permissions`, 
        { permissionIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Rol izinleri güncelleme hatası:', error);
      throw error.response?.data || error;
    }
  }
}

const roleService = new RoleService();
export default roleService;