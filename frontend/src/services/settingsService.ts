import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

// Types
export interface UserSettings {
  theme: string;
  language?: string;
  notifications?: boolean;
  [key: string]: any;
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

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token alma hatası:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class SettingsService {
  // Update user theme
  async updateTheme(theme: string): Promise<ApiResponse<UserSettings>> {
    try {
      const response: AxiosResponse<ApiResponse<UserSettings>> = await api.put('/settings/theme', { theme });
      return response.data;
    } catch (error) {
      console.error('Update theme error:', error);
      throw error;
    }
  }

  // Get user settings
  async getUserSettings(): Promise<ApiResponse<UserSettings>> {
    try {
      const response: AxiosResponse<ApiResponse<UserSettings>> = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Get user settings error:', error);
      throw error;
    }
  }
}

export default new SettingsService();