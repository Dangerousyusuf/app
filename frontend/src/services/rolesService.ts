import { API_BASE_URL, REQUEST_TIMEOUT } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const getRoles = async (): Promise<ApiResponse<Role[]>> => {
  try {
    // TODO: HTTPS Migration - Use authService.getToken() for secure token retrieval
    const token = await AsyncStorage.getItem('auth_token');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Roller yüklenirken hata oluştu');
    }

    const data: ApiResponse<Role[]> = await response.json();
    return data;
  } catch (error) {
    console.error('Rol listesi hatası:', error);
    throw error;
  }
};

const updateRole = async (roleId: string, roleData: UpdateRoleData): Promise<ApiResponse<Role>> => {
  try {
    // Debug: Tüm AsyncStorage key'lerini kontrol et
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('AsyncStorage keys:', allKeys);
    
    // TODO: HTTPS Migration - Use authService.getToken() for secure token retrieval
    const token = await AsyncStorage.getItem('auth_token');
    console.log('updateRole - token:', token);
    console.log('updateRole - roleId:', roleId);
    console.log('updateRole - roleData:', roleData);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Rol güncellenirken hata oluştu');
    }

    const data: ApiResponse<Role> = await response.json();
    return data;
  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    throw error;
  }
};

const createRole = async (roleData: CreateRoleData): Promise<ApiResponse<Role>> => {
  try {
    // TODO: HTTPS Migration - Use authService.getToken() for secure token retrieval
    const token = await AsyncStorage.getItem('auth_token');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Rol oluşturulurken hata oluştu');
    }

    const data: ApiResponse<Role> = await response.json();
    return data;
  } catch (error) {
    console.error('Rol oluşturma hatası:', error);
    throw error;
  }
};

const deleteRole = async (roleId: string): Promise<ApiResponse> => {
  try {
    console.log('=== DELETE ROLE SERVICE BAŞLADI ===');
    console.log('Role ID:', roleId);
    
    const token = await AsyncStorage.getItem('auth_token');
    console.log('Token:', token ? 'Mevcut' : 'Yok');
    
    const url = `${API_BASE_URL}/roles/${roleId}`;
    console.log('DELETE URL:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error('Rol silinirken hata oluştu');
    }

    const data: ApiResponse = await response.json();
    console.log('Delete response data:', data);
    return data;
  } catch (error) {
    console.error('Rol silme hatası:', error);
    throw error;
  }
};

const updateRolePermissions = async (roleId: string, permissionIds: string[]): Promise<ApiResponse> => {
  try {
    // TODO: HTTPS Migration - Use authService.getToken() for secure token retrieval
    const token = await AsyncStorage.getItem('auth_token');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ permission_ids: permissionIds }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Rol izinleri güncellenirken hata oluştu');
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Rol izinleri güncelleme hatası:', error);
    throw error;
  }
};

const getRolePermissions = async (roleId: string): Promise<ApiResponse<Permission[]>> => {
  try {
    // TODO: HTTPS Migration - Use authService.getToken() for secure token retrieval
    const token = await AsyncStorage.getItem('auth_token');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}/permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Rol izinleri yüklenirken hata oluştu');
    }

    const data: ApiResponse<Permission[]> = await response.json();
    return data;
  } catch (error) {
    console.error('Rol izinleri yükleme hatası:', error);
    throw error;
  }
};

export {
  getRoles,
  updateRole,
  createRole,
  deleteRole,
  updateRolePermissions,
  getRolePermissions,
};