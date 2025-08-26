import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { urlUtils } from './urls';

/**
 * Express application configuration
 * @param app - Express application instance
 */
const configureExpress = (app: Application): void => {
  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  
  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);

  // CORS configuration (merkezi yapıdan)
  app.use(cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = urlUtils.getCorsOrigins();
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Origin', 
      'X-Requested-With',
      'Cache-Control'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  // Additional CORS headers for debugging
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    next();
  });

  // Logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Request logging for debugging
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request Body:', req.body);
    }
    next();
  });

  // Body parsing middleware
  app.use(express.json({ 
    limit: '10mb',
    verify: (req: Request, res: Response, buf: Buffer) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        res.status(400).json({
          success: false,
          message: 'Invalid JSON format'
        });
        return;
      }
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));

  // Static file serving for uploads
  app.use('/uploads', express.static(path.join(__dirname, '../../../backend/uploads')));

  // Request timeout middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setTimeout(30000, () => {
      res.status(408).json({
        success: false,
        message: 'Request timeout'
      });
    });
    next();
  });
};

export {
  configureExpress
};