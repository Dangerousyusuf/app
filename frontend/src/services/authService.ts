import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { 
  LoginCredentials, 
  RegisterData, 
  RoleData, 
  AuthServiceInterface, 
  ApiResponse, 
  User, 
  Role 
} from '../types';

// API base URL - HTTPS enforced for production
import { API_BASE_URL } from '../config/api';
import { securityConfig } from '../config/security';

// TODO: HTTPS Migration - Token storage strategy
// - Mobile: Use SecureStore for production (HTTPS required)
// - Web: Migrate to HttpOnly cookies (HTTPS required)
// - Current: AsyncStorage fallback for development only

console.log('API_BASE_URL:', API_BASE_URL);

// Axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test API connection
api.get('/health').then(() => {
  console.log('API bağlantısı başarılı:', API_BASE_URL);
}).catch((error) => {
  console.error('API bağlantı hatası:', error.message);
  console.error('API URL:', API_BASE_URL);
});

class AuthService implements AuthServiceInterface {
  private api: AxiosInstance;

  constructor() {
    this.api = api;
  }

  async login(identifier: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      console.log('Login işlemi başladı:', { identifier });
      
      // Sanitize inputs
      const sanitizedIdentifier = securityConfig.securityValidation.sanitizeInput(identifier);
      
      // Validate HTTPS URL
      const apiUrl = securityConfig.httpSecurity.enforceHttps(API_BASE_URL);
      
      const response = await api.post('/auth/login', { 
        identifier: sanitizedIdentifier, 
        password // Don't sanitize password as it may contain special chars
      }, {
        timeout: securityConfig.timeouts.AUTH_TIMEOUT,
        headers: securityConfig.httpSecurity.getSecureHeaders()
      });
      
      console.log('Login response:', response.data);
      
      // Save token on successful login
      if (response.data && response.data.data && response.data.data.token) {
        console.log('Token kaydediliyor:', response.data.data.token.substring(0, 20) + '...');
        const saveResult = await this.saveToken(response.data.data.token);
        console.log('Token kaydetme sonucu:', saveResult);
        
        // Token'ın gerçekten kaydedildiğini kontrol et
        const savedToken = await this.getToken();
        console.log('Kaydedilen token kontrolü:', savedToken ? 'Token başarıyla kaydedildi' : 'Token kaydedilemedi');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    try {
      console.log('Register çağrıldı, userData:', userData);
      
      // Sanitize user inputs
      const requestData = {
        user_name: securityConfig.securityValidation.sanitizeInput(userData.user_name),
        first_name: securityConfig.securityValidation.sanitizeInput(userData.first_name),
        last_name: securityConfig.securityValidation.sanitizeInput(userData.last_name),
        email: securityConfig.securityValidation.sanitizeInput(userData.email),
        phone: securityConfig.securityValidation.sanitizeInput(userData.phone),
        password: userData.password, // Don't sanitize password
        gender: userData.gender,
        tc: userData.tc || '00000000000',
        birth_date: userData.birth_date || new Date().toISOString().split('T')[0],
        role: userData.role || 'user'
      };
      
      // Validate HTTPS URL
      const apiUrl = securityConfig.httpSecurity.enforceHttps(API_BASE_URL);
      
      console.log('API isteği gönderiliyor:', apiUrl + '/auth/register', requestData);
      
      const response = await api.post('/auth/register', requestData, {
        timeout: securityConfig.timeouts.AUTH_TIMEOUT,
        headers: securityConfig.httpSecurity.getSecureHeaders()
      });
      
      console.log('API yanıtı:', response.data);

      // Kayıt işleminde token kaydetmiyoruz, sadece response döndürüyoruz
      // Kullanıcı manuel olarak giriş yapmalı

      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const token = await this.getToken();
      
      // Add token to request headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Validate HTTPS URL
      const apiUrl = securityConfig.httpSecurity.enforceHttps(API_BASE_URL);
      
      const response = await api.post('/auth/logout', {}, {
        timeout: securityConfig.timeouts.AUTH_TIMEOUT,
        headers: securityConfig.httpSecurity.getSecureHeaders()
      });

      // Clear all secure storage
      await securityConfig.secureStorage.clear();
      
      // Remove Authorization header
      delete api.defaults.headers.common['Authorization'];

      return response.data;
    } catch (error) {
      // Even if the API call fails, we should still remove the token
      await securityConfig.secureStorage.clear();
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  }

  // Token yönetimi
  async saveToken(token: string): Promise<boolean> {
    try {
      if (!securityConfig.securityValidation.isValidToken(token)) {
        throw new Error('Invalid token format');
      }
      
      await securityConfig.secureStorage.setItem(
        securityConfig.storageKeys.AUTH_TOKEN, 
        token
      );
      console.log('Token başarıyla güvenli depolamaya kaydedildi');
      return true;
    } catch (error) {
      console.error('Token kaydetme hatası:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await securityConfig.secureStorage.getItem(
        securityConfig.storageKeys.AUTH_TOKEN
      );
      
      // Validate token before returning
      if (token && !securityConfig.securityValidation.isValidToken(token)) {
        console.warn('Invalid token found, removing...');
        await this.removeToken();
        return null;
      }
      
      // Check if token is expired
      if (token && securityConfig.securityValidation.isTokenExpired(token)) {
        console.warn('Expired token found, removing...');
        await this.removeToken();
        return null;
      }
      
      console.log('Alınan token:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    } catch (error) {
      console.error('Token alma hatası:', error);
      return null;
    }
  }

  async removeToken(): Promise<boolean> {
    try {
      await securityConfig.secureStorage.removeItem(
        securityConfig.storageKeys.AUTH_TOKEN
      );
      console.log('Token güvenli depolamadan silindi');
      return true;
    } catch (error) {
      console.error('Token silme hatası:', error);
      return false;
    }
  }
  
  // Kullanıcının giriş yapmış olup olmadığını kontrol et
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token; // token varsa true, yoksa false döndür
  }
  
  // Add token to axios headers for authenticated requests with security headers
  async setAuthHeader(): Promise<void> {
    // Apply secure headers
    const secureHeaders = securityConfig.httpSecurity.getSecureHeaders();
    Object.assign(api.defaults.headers.common, secureHeaders);
    
    const token = await this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      // Set auth header
      await this.setAuthHeader();
      
      const response = await api.get('/profile/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create role
  async createRole(roleData: RoleData): Promise<ApiResponse<Role>> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      // Set auth header
      await this.setAuthHeader();
      
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      // Backend'ten gelen hata mesajını koru
      if (error.response && error.response.data) {
        const backendError = new Error(error.response.data.message || 'Rol oluşturulurken bir hata oluştu') as any;
        if (error && typeof error === 'object' && 'response' in error) {
          backendError.response = (error as any).response;
        }
        throw backendError;
      }
      
      throw error;
    }
  }

  // Get roles
  async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No token found');
      }
      
      // Set auth header
      await this.setAuthHeader();
      
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(imageSource: string | File | Blob): Promise<ApiResponse<{ profilePictureUrl: string }>> {
    try {
      console.log('uploadProfilePicture başladı, imageSource:', imageSource);
      
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // Web için File objesi veya Blob
        formData.append('profileImage', imageSource as Blob, 'profile.jpg');
      } else {
        // Mobil için URI - React Native'de FormData farklı çalışır
        const filename = typeof imageSource === 'string' ? imageSource.split('/').pop() : 'profile.jpg';
        const match = /\.([\w\d_-]+)$/i.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        console.log('Mobil dosya bilgileri:', { filename, type, uri: imageSource });
        
        // React Native için doğru format
        formData.append('profileImage', {
          uri: imageSource as string,
          type: type,
          name: filename || 'profile.jpg',
        } as any);
      }
      
      // Token'ı al
      console.log('Token alınıyor...');
      const token = await this.getToken();
      console.log('Alınan token:', token ? 'Token mevcut' : 'Token yok');
      
      if (!token) {
        console.error('Token bulunamadı!');
        throw new Error('No authentication token found');
      }
      
      // Request headers - Content-Type'ı axios otomatik ayarlasın
      const headers = {
        'Authorization': `Bearer ${token}`,
        // Content-Type'ı manuel olarak ayarlama, axios otomatik boundary ekleyecek
      };
      
      console.log('API isteği gönderiliyor, headers:', headers);
      console.log('API URL:', API_BASE_URL + '/profile/upload-picture');
      console.log('FormData içeriği kontrol ediliyor...');
      
      // FormData içeriğini debug için logla
      try {
        const entries = (formData as any).entries();
        if (entries) {
          for (let [key, value] of entries) {
            console.log('FormData entry:', key, value);
          }
        }
      } catch (e) {
        console.log('FormData entries not available');
      }
      
      const response = await api.post('/profile/upload-picture', formData, {
        headers: headers,
        transformRequest: [(data) => {
          console.log('Transform request çağrıldı, data:', data);
          return data;
        }],
      });
      
      console.log('Upload başarılı, response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile picture upload error:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;