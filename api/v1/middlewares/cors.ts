import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { urlUtils } from '../config/urls';

type OriginCallback = (err: Error | null, allow?: boolean) => void;
type OriginFunction = (origin: string | undefined, callback: OriginCallback) => void;
type OriginType = string | RegExp | (string | RegExp)[] | OriginFunction;

interface CorsOptionsType {
  origin: OriginType;
  credentials: boolean;
  optionsSuccessStatus: number;
}

// CORS configuration for different environments
const corsOptions = {
  development: {
    origin: urlUtils.getCorsOrigins(),
    credentials: true,
    optionsSuccessStatus: 200
  },
  production: {
    origin: function(origin: string | undefined, callback: OriginCallback) {
      // Get allowed origins from environment
      const allowedOrigins = process.env.CORS_ALLOWLIST ? 
        process.env.CORS_ALLOWLIST.split(',').map(o => o.trim()) : [];
      
      // Allow requests with no origin (mobile apps)
      if (!origin) {
        return callback(null, true);
      }
      
      // Only allow HTTPS origins in production
      if (!origin.startsWith('https://')) {
        return callback(new Error('Only HTTPS origins allowed in production'));
      }
      
      // Check if origin is in allowlist
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  }
};

// Dynamic CORS middleware
const dynamicCors = (req: Request, res: Response, next: NextFunction) => {
  const env = process.env.NODE_ENV || 'development';
  const options = (corsOptions as any)[env] || corsOptions.development;
  
  // Enhanced origin checking
  const corsMiddleware = cors({
    ...options,
    origin: (origin: string | undefined, callback: OriginCallback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      const allowedOrigins = Array.isArray(options.origin) ? options.origin : [options.origin];
      
      const isAllowed = allowedOrigins.some((allowedOrigin: any) => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        }
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
      'X-HTTP-Method-Override'
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'Link'
    ],
    preflightContinue: false,
    optionsSuccessStatus: options.optionsSuccessStatus
  });
  
  corsMiddleware(req, res, next);
};

// Simple CORS for development
const simpleCors = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: false
});

export {
  dynamicCors,
  simpleCors,
  corsOptions
};

export default dynamicCors;