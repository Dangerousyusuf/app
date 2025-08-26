import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Security middleware configuration for HTTPS environments
 * Provides comprehensive security headers and protections
 */
export const securityMiddleware = () => {
  // Base helmet configuration with simplified options
  const helmetConfig: any = {
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
      action: 'deny'
    },
    
    // X-Content-Type-Options
    noSniff: true,
    
    // Hide X-Powered-By header
    hidePoweredBy: true,
    
    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false
    }
  };
  
  // Disable HSTS for development
  if (process.env.NODE_ENV === 'development') {
    delete helmetConfig.hsts;
    console.log('Security: HSTS disabled for development environment');
  }
  
  return helmet(helmetConfig);
};

/**
 * Custom security headers middleware
 * Adds additional security headers not covered by helmet
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Only add HTTPS-specific headers in production
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true') {
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
export const secureCookieConfig = {
  // Cookie security settings
  secure: process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true',
  httpOnly: true,
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  
  // Domain settings (set in production)
  domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
};

/**
 * Security validation middleware
 * Validates security requirements are met
 */
export const validateSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Check HTTPS in production
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true') {
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

/**
 * JWT Cookie configuration for secure token storage
 * Alternative to Authorization header for web clients
 */
export const jwtCookieConfig = {
  ...secureCookieConfig,
  maxAge: 15 * 60 * 1000, // 15 minutes for access token
};

export const refreshTokenCookieConfig = {
  ...secureCookieConfig,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};

/**
 * Usage Notes:
 * 
 * 1. Install helmet: npm install helmet @types/helmet
 * 2. Apply in app.ts before routes:
 *    app.use(securityMiddleware());
 *    app.use(customSecurityHeaders);
 *    app.use(validateSecurity);
 * 
 * 3. Use secureCookieConfig for session cookies:
 *    app.use(session({ cookie: secureCookieConfig }));
 * 
 * 4. JWT Cookie Usage:
 *    res.cookie('accessToken', token, jwtCookieConfig);
 *    res.cookie('refreshToken', refreshToken, refreshTokenCookieConfig);
 * 
 * 5. HTTPS Requirements:
 *    - HSTS only works over HTTPS
 *    - Secure cookies require HTTPS
 *    - CSP upgrade-insecure-requests needs HTTPS
 * 
 * 6. Production Checklist:
 *    - Set FORCE_HTTPS=true
 *    - Set COOKIE_DOMAIN to your domain
 *    - Test all security headers
 *    - Verify HSTS preload eligibility
 */