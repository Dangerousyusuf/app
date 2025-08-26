/**
 * Merkezi URL Yönetimi - API Gateway
 * Tüm URL'ler bu dosyadan yönetilir
 * Frontend'deki api.ts mantığının API Gateway versiyonu
 */

// Environment değişkenlerinden URL'leri al
const getEnvUrl = (envVar: string, fallback: string): string => {
  return process.env[envVar] || fallback;
};

/**
 * Backend Service URL'leri
 */
export const BACKEND_URLS = {
  // Ana backend servisi
  BASE: getEnvUrl('BACKEND_URL', 'http://localhost:3000'),
  API: getEnvUrl('BACKEND_URL', 'http://localhost:3000') + '/api',
  
  // Alternatif backend portları
  FALLBACK: 'http://localhost:5000',
  FALLBACK_API: 'http://localhost:5000/api'
} as const;

/**
 * Frontend ve Development URL'leri
 */
export const FRONTEND_URLS = {
  // Localhost development
  LOCALHOST: 'http://localhost:3000',
  
  // Expo development server
  EXPO_DEV: 'http://localhost:8081',
  EXPO_WEB: 'http://localhost:19006',
  EXPO_TUNNEL: 'exp://localhost:19000',
  
  // Production IP (HTTPS)
  PRODUCTION_IP: 'https://192.168.1.5:3000'
} as const;

/**
 * API Gateway URL'leri
 */
export const API_GATEWAY_URLS = {
  // Development
  DEV_BASE: getEnvUrl('API_BASE_URL', 'http://localhost:3001/api/v1'),
  
  // Production
  PROD_BASE: 'https://192.168.1.5:3001/api/v1'
} as const;

/**
 * CORS İzinli Origin'ler
 */
export const CORS_ORIGINS = {
  DEVELOPMENT: [
    FRONTEND_URLS.LOCALHOST,
    FRONTEND_URLS.EXPO_DEV,
    FRONTEND_URLS.EXPO_WEB,
    FRONTEND_URLS.EXPO_TUNNEL,
    'https://localhost:3000',
    'https://127.0.0.1:3000',
    FRONTEND_URLS.PRODUCTION_IP,
    // Regex pattern for dynamic IPs
    /^http:\/\/192\.168\.[0-9]{1,3}\.[0-9]{1,3}:19006$/,
    /^http:\/\/192\.168\.[0-9]{1,3}\.[0-9]{1,3}:8081$/
  ],
  
  PRODUCTION: [
    FRONTEND_URLS.PRODUCTION_IP,
    'https://yourdomain.com'
  ]
} as const;

/**
 * URL Utility Functions
 */
export const urlUtils = {
  /**
   * Backend URL'ini environment'a göre döndür
   */
  getBackendUrl: (path: string = ''): string => {
    const baseUrl = BACKEND_URLS.BASE;
    return path ? `${baseUrl}${path.startsWith('/') ? path : '/' + path}` : baseUrl;
  },
  
  /**
   * Backend API URL'ini döndür
   */
  getBackendApiUrl: (endpoint: string = ''): string => {
    const apiUrl = BACKEND_URLS.API;
    return endpoint ? `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}` : apiUrl;
  },
  
  /**
   * Environment'a göre CORS origins döndür
   */
  getCorsOrigins: (): (string | RegExp)[] => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'production' ? CORS_ORIGINS.PRODUCTION : CORS_ORIGINS.DEVELOPMENT;
  },
  
  /**
   * URL'in geçerli olup olmadığını kontrol et
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Export all for easy access
 */
export default {
  BACKEND_URLS,
  FRONTEND_URLS,
  API_GATEWAY_URLS,
  CORS_ORIGINS,
  urlUtils
};