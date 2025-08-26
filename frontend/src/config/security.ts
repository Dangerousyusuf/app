import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Security configuration for HTTPS environments
 * Handles secure storage, cookie settings, and security headers
 */

// Environment detection
const isProduction = process.env.EXPO_PUBLIC_NODE_ENV === 'production';
const isWeb = Platform.OS === 'web';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Secure token storage configuration
 * Uses SecureStore for mobile, AsyncStorage for web (with future HttpOnly cookie migration)
 */
export const secureStorage = {
  /**
   * Store sensitive data securely
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isMobile && SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(key, value, {
          requireAuthentication: false, // Set to true for biometric protection
          keychainService: 'app-keychain',
          touchID: false, // Enable for Touch ID requirement
          showModal: false,
        });
      } else {
        // Fallback to AsyncStorage for web/development
        // TODO: Migrate to HttpOnly cookies for web in production
        await AsyncStorage.setItem(key, value);
        
        if (isProduction && isWeb) {
          console.warn('Security Warning: Using AsyncStorage in production web. Migrate to HttpOnly cookies.');
        }
      }
    } catch (error) {
      console.error('Secure storage setItem failed:', error);
      throw new Error('Failed to store secure data');
    }
  },

  /**
   * Retrieve sensitive data securely
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (isMobile && SecureStore.isAvailableAsync()) {
        return await SecureStore.getItemAsync(key, {
          requireAuthentication: false,
          keychainService: 'app-keychain',
        });
      } else {
        // Fallback to AsyncStorage for web/development
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Secure storage getItem failed:', error);
      return null;
    }
  },

  /**
   * Remove sensitive data securely
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (isMobile && SecureStore.isAvailableAsync()) {
        await SecureStore.deleteItemAsync(key, {
          keychainService: 'app-keychain',
        });
      } else {
        // Fallback to AsyncStorage for web/development
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Secure storage removeItem failed:', error);
      throw new Error('Failed to remove secure data');
    }
  },

  /**
   * Clear all secure data
   */
  async clear(): Promise<void> {
    try {
      if (isMobile && SecureStore.isAvailableAsync()) {
        // SecureStore doesn't have a clear method, so we need to track keys
        const keys = ['auth_token', 'refresh_token', 'user_data'];
        await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key, {
          keychainService: 'app-keychain',
        })));
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error('Secure storage clear failed:', error);
      throw new Error('Failed to clear secure data');
    }
  }
};

/**
 * HTTP security configuration
 * Handles secure HTTP requests and headers
 */
export const httpSecurity = {
  /**
   * Default headers for secure requests
   */
  getSecureHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    // Add security headers for production
    if (isProduction) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
      headers['X-Content-Type-Options'] = 'nosniff';
      headers['X-Frame-Options'] = 'DENY';
      headers['X-XSS-Protection'] = '1; mode=block';
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    return headers;
  },

  /**
   * Validate HTTPS URL
   */
  validateHttpsUrl(url: string): boolean {
    if (!url) return false;
    
    // Allow HTTP in development
    if (!isProduction) {
      return url.startsWith('http://') || url.startsWith('https://');
    }
    
    // Require HTTPS in production
    return url.startsWith('https://');
  },

  /**
   * Enforce HTTPS URL
   */
  enforceHttps(url: string): string {
    if (!url) return url;
    
    // Don't modify in development
    if (!isProduction) return url;
    
    // Convert HTTP to HTTPS in production
    if (url.startsWith('http://')) {
      console.warn('Security: Converting HTTP to HTTPS:', url);
      return url.replace('http://', 'https://');
    }
    
    return url;
  }
};

/**
 * Certificate pinning configuration (for future implementation)
 * Prevents man-in-the-middle attacks
 */
export const certificatePinning = {
  /**
   * Expected certificate hashes for production domains
   * TODO: Implement certificate pinning for production
   */
  expectedHashes: {
    // 'yourdomain.com': ['sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=']
  },

  /**
   * Validate certificate (placeholder)
   */
  validateCertificate(domain: string, hash: string): boolean {
    if (!isProduction) return true;
    
    const expectedHash = this.expectedHashes[domain as keyof typeof this.expectedHashes];
    return expectedHash ? expectedHash.includes(hash) : true;
  }
};

/**
 * Security validation utilities
 */
export const securityValidation = {
  /**
   * Validate token format
   */
  isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format validation
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  },

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < now;
    } catch {
      return true; // Invalid token format
    }
  },

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Basic XSS prevention
    return input
      .replace(/[<>"'&]/g, (match) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[match] || match;
      })
      .trim();
  }
};

/**
 * Security configuration export
 */
export const securityConfig = {
  // Environment flags
  isProduction,
  isWeb,
  isMobile,
  
  // Storage
  secureStorage,
  
  // HTTP Security
  httpSecurity,
  
  // Certificate Pinning
  certificatePinning,
  
  // Validation
  securityValidation,
  
  // Token storage keys
  storageKeys: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    BIOMETRIC_ENABLED: 'biometric_enabled'
  },
  
  // Security timeouts
  timeouts: {
    API_TIMEOUT: 30000, // 30 seconds
    AUTH_TIMEOUT: 15000, // 15 seconds
    RETRY_DELAY: 1000   // 1 second
  }
};

export default securityConfig;

/**
 * Usage Notes:
 * 
 * 1. Token Storage:
 *    await secureStorage.setItem('auth_token', token);
 *    const token = await secureStorage.getItem('auth_token');
 * 
 * 2. Secure Headers:
 *    const headers = httpSecurity.getSecureHeaders();
 * 
 * 3. URL Validation:
 *    const isValid = httpSecurity.validateHttpsUrl(url);
 *    const secureUrl = httpSecurity.enforceHttps(url);
 * 
 * 4. Token Validation:
 *    const isValid = securityValidation.isValidToken(token);
 *    const isExpired = securityValidation.isTokenExpired(token);
 * 
 * 5. Input Sanitization:
 *    const clean = securityValidation.sanitizeInput(userInput);
 * 
 * 6. Production Checklist:
 *    - Enable certificate pinning
 *    - Implement biometric authentication
 *    - Migrate web storage to HttpOnly cookies
 *    - Enable HSTS headers
 *    - Test all security validations
 */