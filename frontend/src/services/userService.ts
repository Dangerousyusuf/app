import axios, { AxiosInstance, AxiosResponse } from 'axios';
import authService from './authService';

// API Response Types
export interface User {
  id: string;
  email: string;
  name?: string;
  theme_preference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  key?: string;
  name?: string;
  permission_name?: string;
  description?: string;
  permission_description?: string;
  module: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// API base URL - HTTPS enforced for production
import { API_BASE_URL } from '../config/api';

// Axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

class UserService {
  async getAllUsers(page: number = 1, limit: number = 50, search: string = ''): Promise<PaginatedResponse<User>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      // Önce admin endpoint'ini dene
      try {
        const response: AxiosResponse<PaginatedResponse<User>> = await api.get('/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            page,
            limit,
            search
          }
        });

        console.log('Admin users API response:', response.data);
        return response.data;
      } catch (adminError: any) {
        // Admin değilse search endpoint'ini kullan
         if (adminError.response?.status === 403) {
            console.log('Admin yetkisi yok, search endpoint kullanılıyor...');
            return await this.searchUsers('', page, limit);
          }
        throw adminError;
      }
    } catch (error: any) {
      console.error('Get users error:', error);
      if (error.response?.status === 401) {
        throw new Error('Yetkisiz erişim');
      }
      throw new Error(error.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu');
    }
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<PaginatedResponse<User>> = await api.get('/users/search', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          page,
          limit
        }
      });

      console.log('Search users API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Search users error:', error);
      if (error.response?.status === 401) {
        throw new Error('Yetkisiz erişim');
      }
      throw new Error(error.response?.data?.message || 'Kullanıcı arama sırasında hata oluştu');
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<User>> = await api.get(`/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Get user by ID API response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Get user by ID error:', error);
      if (error.response?.status === 401) {
        throw new Error('Yetkisiz erişim');
      }
      if (error.response?.status === 404) {
        throw new Error('Kullanıcı bulunamadı');
      }
      throw new Error(error.response?.data?.message || 'Kullanıcı bilgileri yüklenirken hata oluştu');
    }
  }

  async updateUserTheme(userId: string, themePreference: string): Promise<User> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<User>> = await api.put(`/users/${userId}`, {
        theme_preference: themePreference
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Update user theme API response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Update user theme error:', error);
      if (error.response?.status === 401) {
        throw new Error('Yetkisiz erişim');
      }
      if (error.response?.status === 404) {
        throw new Error('Kullanıcı bulunamadı');
      }
      throw new Error(error.response?.data?.message || 'Tema güncellenirken hata oluştu');
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<User>> = await api.put(`/users/${userId}`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Update user API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update user error:', error);
      if (error.response?.status === 401) {
        throw new Error('Yetkisiz erişim');
      }
      if (error.response?.status === 404) {
        throw new Error('Kullanıcı bulunamadı');
      }
      throw new Error(error.response?.data?.message || 'Kullanıcı güncellenirken hata oluştu');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.delete(`/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Delete user API response:', response.data);
    } catch (error: any) {
      console.error('Delete user error:', error);
      if (error.response?.status === 401) {
        throw new Error('Yetkisiz erişim');
      }
      if (error.response?.status === 404) {
        throw new Error('Kullanıcı bulunamadı');
      }
      throw new Error(error.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    }
  }

  // Rol yönetimi fonksiyonları
  async getUserRoles(userId: string): Promise<ApiResponse<Role[]>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Role[]>> = await api.get(`/users/${userId}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcı rolleri getirme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.post(`/users/${userId}/roles`, 
        { roleId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcıya rol atama hatası:', error);
      throw error.response?.data || error;
    }
  }

  async updateUserRoles(userId: string, roleIds: string[]): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.put(`/users/${userId}/roles`, 
        { roleIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcı rolleri güncelleme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.delete(`/users/${userId}/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcıdan rol kaldırma hatası:', error);
      throw error.response?.data || error;
    }
  }

  // İzin yönetimi fonksiyonları
  async getUserPermissions(userId: string): Promise<ApiResponse<Permission[]>> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse<Permission[]>> = await api.get(`/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcı izinleri getirme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async assignPermissionToUser(userId: string, permissionId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.post(`/users/${userId}/permissions`, 
        { permissionId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcıya izin atama hatası:', error);
      throw error.response?.data || error;
    }
  }

  async updateUserPermissions(userId: string, permissionIds: string[]): Promise<ApiResponse> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.put(`/users/${userId}/permissions`, 
        { permissionIds },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcı izinleri güncelleme hatası:', error);
      throw error.response?.data || error;
    }
  }

  async removePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    try {
      const token = await authService.getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response: AxiosResponse<ApiResponse> = await api.delete(`/users/${userId}/permissions/${permissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Kullanıcıdan izin kaldırma hatası:', error);
      throw error.response?.data || error;
    }
  }
}

const userService = new UserService();
export default userService;