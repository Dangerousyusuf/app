import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import errorHandler from './middlewares/errorHandler';
import { securityMiddleware, customSecurityHeaders, validateSecurity } from './middleware/security';

const app = express();

// Trust proxy for HTTPS termination
if (process.env.TRUST_PROXY !== 'false') {
  app.set('trust proxy', 1);
}

// HTTPS redirect middleware (production only)
if (process.env.FORCE_HTTPS === 'true' && process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Development: Allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Production: Only allow specific origins
    const allowedOrigins = process.env.CORS_ALLOWLIST ? 
      process.env.CORS_ALLOWLIST.split(',').map((o: string) => o.trim()) : [];
    
    // Only allow HTTPS origins in production
    if (process.env.NODE_ENV === 'production' && !origin.startsWith('https://')) {
      return callback(new Error('Only HTTPS origins allowed in production'));
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply security middleware (before other middleware) - temporarily disabled
// app.use(securityMiddleware());
// app.use(customSecurityHeaders);
// app.use(validateSecurity);

app.use(cors(corsOptions));

// Security middleware (before other middleware)
app.use(securityMiddleware());
app.use(customSecurityHeaders);
app.use(validateSecurity);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware with security masking
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Mask sensitive headers
  const maskedHeaders = { ...req.headers };
  if (maskedHeaders.authorization) {
    maskedHeaders.authorization = '[MASKED]';
  }
  if (maskedHeaders.cookie) {
    maskedHeaders.cookie = '[MASKED]';
  }
  console.log('Request Headers:', maskedHeaders);
  
  // Mask sensitive body fields
  if (req.body && Object.keys(req.body).length > 0) {
    const maskedBody = { ...req.body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'phone', 'email', 'tc'];
    
    sensitiveFields.forEach(field => {
      if (maskedBody[field]) {
        maskedBody[field] = '[MASKED]';
      }
    });
    
    console.log('Request Body:', maskedBody);
  } else {
    console.log('Request Body: empty or undefined');
  }
  next();
});

// Statik dosya servisi - uploads klasörü
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

export default app;