import helmet from 'helmet';
import environment from '../config/environment';
import { Request, Response, NextFunction } from 'express';

// Type definitions for security middleware
interface SecureCookieConfig {
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  domain?: string;
}

/**
 * Security middleware configuration for HTTPS environments
 * Provides comprehensive security headers and protections
 */
const securityMiddleware = () => {
  // Base helmet configuration
  const helmetConfig = {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https:"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"]
      }
    },
    
    // HTTP Strict Transport Security (HSTS)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    
    // X-Frame-Options
    frameguard: {
      action: 'deny' as const
    },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // X-XSS-Protection
    xssFilter: true,
    
    // Referrer Policy
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin' as const
    },
    
    // Permissions Policy
    permissionsPolicy: {
      geolocation: [],
      microphone: [],
      camera: [],
      fullscreen: ['self'],
      payment: []
    },
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
    
    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false
    },
    
    // Expect-CT (Certificate Transparency)
    expectCt: {
      maxAge: 86400, // 24 hours
      enforce: true
    }
  };
  
  // Disable HSTS for development
  if (environment.NODE_ENV === 'development') {
    (helmetConfig as any).hsts = false;
    console.log('Security: HSTS disabled for development environment');
  }
  
  return helmet(helmetConfig);
};

/**
 * Custom security headers middleware
 * Adds additional security headers not covered by helmet
 */
const customSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Only add HTTPS-specific headers in production
  if (environment.NODE_ENV === 'production' && environment.FORCE_HTTPS) {
    // Strict Transport Security (backup)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Clear Site Data (for logout scenarios)
    if (req.path === '/auth/logout') {
      res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
    }
  }
  
  // Cross-Origin Resource Policy
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Cross-Origin Embedder Policy
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Cross-Origin Opener Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  // Server header removal
  res.removeHeader('Server');
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * Cookie security configuration
 * Ensures cookies are secure in HTTPS environments
 */
const secureCookieConfig: SecureCookieConfig = {
  // Cookie security settings
  secure: environment.NODE_ENV === 'production' && environment.FORCE_HTTPS,
  httpOnly: true,
  sameSite: environment.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  
  // Domain settings (set in production)
  domain: environment.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
};

/**
 * Security validation middleware
 * Validates security requirements are met
 */
const validateSecurity = (req: Request, res: Response, next: NextFunction): Response | void => {
  // Check HTTPS in production
  if (environment.NODE_ENV === 'production' && environment.FORCE_HTTPS) {
    if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
      console.warn('Security Warning: Non-HTTPS request in production:', req.url);
      return res.status(426).json({
        success: false,
        message: 'HTTPS Required',
        error: 'This API requires HTTPS in production environment'
      });
    }
  }
  
  // Validate security headers
  const requiredHeaders = ['user-agent'];
  for (const header of requiredHeaders) {
    if (!req.get(header)) {
      console.warn('Security Warning: Missing required header:', header);
    }
  }
  
  next();
};

export {
  securityMiddleware,
  customSecurityHeaders,
  secureCookieConfig,
  validateSecurity
};

export default {
  securityMiddleware,
  customSecurityHeaders,
  secureCookieConfig,
  validateSecurity
};

/**
 * Usage Notes:
 * 
 * 1. Install helmet: npm install helmet
 * 2. Apply in server.js before routes:
 *    app.use(securityMiddleware());
 *    app.use(customSecurityHeaders);
 *    app.use(validateSecurity);
 * 
 * 3. Use secureCookieConfig for session cookies:
 *    app.use(session({ cookie: secureCookieConfig }));
 * 
 * 4. HTTPS Requirements:
 *    - HSTS only works over HTTPS
 *    - Secure cookies require HTTPS
 *    - CSP upgrade-insecure-requests needs HTTPS
 * 
 * 5. Production Checklist:
 *    - Set FORCE_HTTPS=true
 *    - Set COOKIE_DOMAIN to your domain
 *    - Test all security headers
 *    - Verify HSTS preload eligibility
 */