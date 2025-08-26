// API Configuration - Environment based URLs
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) {
    // Validate HTTPS in production
    if (process.env.NODE_ENV === 'production' && !envUrl.startsWith('https://')) {
      throw new Error('Production API URL must use HTTPS');
    }
    return envUrl;
  }
  
  // Development fallback
  if (__DEV__) {
    return 'http://192.168.1.5:3001/api/v1';
  }
  
  // Production default (should be overridden by env var)
  throw new Error('EXPO_PUBLIC_API_BASE_URL environment variable is required in production');
};

const getBackendUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl) {
    if (process.env.NODE_ENV === 'production' && !envUrl.startsWith('https://')) {
      throw new Error('Production Backend URL must use HTTPS');
    }
    return envUrl;
  }
  
  if (__DEV__) {
    return 'http://192.168.1.5:3002/api';
  }
  
  throw new Error('EXPO_PUBLIC_BACKEND_URL environment variable is required in production');
};

// Merkezi URL Yönetimi - Tüm hardcoded URL'ler için
const getImageBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;
  if (envUrl) {
    if (process.env.NODE_ENV === 'production' && !envUrl.startsWith('https://')) {
      throw new Error('Production Image URL must use HTTPS');
    }
    return envUrl;
  }
  
  if (__DEV__) {
    return 'http://192.168.1.5:3002'; // Backend port for images
  }
  
  throw new Error('EXPO_PUBLIC_IMAGE_BASE_URL environment variable is required in production');
};

// Platform-aware URL helper - Devre dışı bırakıldı
// Web'de de 192.168.1.5 kullanılacak çünkü backend orada çalışıyor
const getPlatformAwareUrl = (baseUrl: string): string => {
  return baseUrl; // Artık dönüşüm yapmıyor
};

export const API_BASE_URL: string = getApiBaseUrl();

// API Gateway URL (varsayılan)
export const API_GATEWAY_URL: string = getApiBaseUrl();

// Backend Direct URL (gerekirse)
export const BACKEND_URL: string = getBackendUrl();

// Image Base URL
export const IMAGE_BASE_URL: string = getImageBaseUrl();

// Request timeout (ms)
export const REQUEST_TIMEOUT: number = 30000;

// Default headers
export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Merkezi URL Servisleri - Tüm ekranlar için
export const urlService = {
  // API URLs
  getApiUrl: () => getPlatformAwareUrl(getApiBaseUrl()),
  getBackendUrl: () => getPlatformAwareUrl(getBackendUrl()),
  getImageUrl: () => getPlatformAwareUrl(getImageBaseUrl()),
  
  // Image URL builders with null/undefined safety
  getAvatarUrl: (filename: string | null | undefined) => {
    if (!filename || filename === 'default.jpg' || filename.trim() === '') return null;
    return `${getPlatformAwareUrl(getImageBaseUrl())}/uploads/images/avatars/${filename}`;
  },
  getLogoUrl: (filename: string | null | undefined) => {
    if (!filename || filename.trim() === '') return null;
    return `${getPlatformAwareUrl(getImageBaseUrl())}/uploads/images/logos/${filename}`;
  },
  getImageUrlWithTimestamp: (path: string | null | undefined) => {
    if (!path || path.trim() === '') return null;
    return `${getPlatformAwareUrl(getImageBaseUrl())}/uploads/images/${path}?t=${Date.now()}`;
  },
  
  // Network change helper - Wi-Fi değiştiğinde kullanılacak
  updateUrls: (newIp: string) => {
    // Bu fonksiyon sadece development'ta çalışır
    if (__DEV__) {
      console.warn('URL güncelleme için .env dosyalarını düzenleyin ve uygulamayı yeniden başlatın.');
      console.log(`Yeni IP: ${newIp}`);
      console.log('Güncellenecek dosyalar:');
      console.log('- frontend/.env (EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_BACKEND_URL)');
      console.log('- api/.env (BACKEND_URL, CORS_ORIGINS)');
      console.log('- backend/.env (API_BASE_URL)');
    }
  }
};
