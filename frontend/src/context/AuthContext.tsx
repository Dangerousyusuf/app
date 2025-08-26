import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
import { User, AuthContextType, LoginCredentials, RegisterData, ApiResponse } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Uygulama başladığında token kontrolü
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      console.log('AuthContext: checkAuthStatus başladı');
      const savedToken = await authService.getToken();
      console.log('AuthContext: Kaydedilmiş token:', savedToken ? 'Token mevcut' : 'Token yok');
      
      if (savedToken) {
        console.log('AuthContext: Token bulundu, state güncelleniyor');
        setToken(savedToken);
        // Set auth header for future requests
        await authService.setAuthHeader();
        console.log('AuthContext: Auth header set edildi');
        
        // Token varsa kullanıcı bilgilerini backend'den al
        try {
          console.log('AuthContext: Kullanıcı bilgileri alınıyor');
          const userResponse = await authService.getCurrentUser();
          if (userResponse.success) {
            console.log('AuthContext: Kullanıcı bilgileri başarıyla alındı:', userResponse.data);
            // Backend'den gelen response.data.user formatını düzelt
            const userData = userResponse.data?.user || userResponse.data;
            setUser(userData);
          }
        } catch (error) {
          console.error('AuthContext: Failed to get current user:', error);
          // Token geçersizse temizle
          await authService.logout();
        }
      } else {
        console.log('AuthContext: Token bulunamadı, kullanıcı giriş yapmamış');
      }
    } catch (error) {
      console.error('AuthContext: Auth status check failed:', error);
    } finally {
      setLoading(false);
      console.log('AuthContext: checkAuthStatus tamamlandı');
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      console.log('AuthContext: Login işlemi başladı');
      setLoading(true);
      const response = await authService.login(credentials.identifier, credentials.password);
      
      console.log('AuthContext: Login response:', response);
      
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        console.log('AuthContext: Login başarılı, user ve token state güncelleniyor');
        // Backend'den gelen response.data.user formatını düzelt
        const userDataFormatted = userData?.user || userData;
        setUser(userDataFormatted);
        setToken(userToken);
        // Token is already saved in authService.login
        // Set auth header for future requests
        await authService.setAuthHeader();
        console.log('AuthContext: Auth header set edildi');
        
        // Kullanıcı bilgilerini backend'den yenile (profil resmi dahil)
        await refreshUser();
        
        console.log('AuthContext: Login tamamlandı');
      } else {
        console.log('AuthContext: Login başarısız:', response.message);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Kullanıcı state'ini tamamen temizle
      setUser(null);
      setToken(null);
      // Token is already removed in authService.logout
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı bilgilerini yenile (profil resmi upload sonrası için)
  const refreshUser = async (): Promise<{ success: boolean }> => {
    try {
      const userResponse = await authService.getCurrentUser();
      if (userResponse.success) {
        console.log('AuthContext: Kullanıcı bilgileri yenilendi:', userResponse.data);
        // Backend'den gelen response.data.user formatını düzelt
        const userData = userResponse.data?.user || userResponse.data;
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      console.error('AuthContext: Failed to refresh user:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    refreshUser,
    isAuthenticated: !!user, // Bu değer kullanıcı oturum durumunu kontrol eder
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};