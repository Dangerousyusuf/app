import express, { Request, Response, NextFunction, Application } from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Import configurations
import environment from './v1/config/environment';
import { configureExpress } from './v1/config/express';
import swaggerConfig from './v1/config/swagger';
import { logger } from './utils/logger';

// Import middleware
import { dynamicCors } from './v1/middlewares/cors';
import { apiLimiter } from './v1/middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './v1/middlewares/errorHandler';
import { securityMiddleware, customSecurityHeaders, validateSecurity } from './v1/middlewares/security';

// Import routes
import apiV1Routes from './v1';

// Create Express app
const app = express();

// Trust proxy for HTTPS termination
if (environment.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// HTTPS redirect middleware (production only)
if (environment.FORCE_HTTPS && environment.isProduction()) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Configure Express with all middleware
configureExpress(app);

// Apply security middleware (before other middleware)
app.use(securityMiddleware());
app.use(customSecurityHeaders);
app.use(validateSecurity);

// Apply CORS
app.use(dynamicCors);

// Apply rate limiting
app.use(apiLimiter);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));

// Swagger documentation (only in development or if explicitly enabled)
if (environment.isSwaggerEnabled()) {
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  
  try {
    const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
    
    // Update server URLs based on environment
    swaggerDocument.servers = [{
      url: environment.getApiUrl(),
      description: `${environment.getNodeEnv()} server`
    }];
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API Gateway Documentation'
    }));
    
    logger.info('Swagger documentation enabled', {
      url: `${environment.getApiUrl()}/api-docs`
    });
  } catch (error) {
    logger.error('Failed to load Swagger documentation', { error: (error as Error).message });
  }
}

// API routes
app.use('/api/v1', apiV1Routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: environment.getNodeEnv(),
    version: environment.getApiVersion(),
    services: {
      backend: 'checking...'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };
  
  // Check backend service health
  const { getHttpClient } = require('./utils/httpClient');
  const httpClient = getHttpClient();
  httpClient.healthCheck()
    .then(() => {
      healthData.services.backend = 'healthy';
      res.status(200).json(healthData);
    })
    .catch(() => {
      healthData.services.backend = 'unhealthy';
      healthData.status = 'DEGRADED';
      res.status(503).json(healthData);
    });
});

// Detailed health check for monitoring
app.get('/health/detailed', (req: Request, res: Response) => {
  const detailedHealth = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: environment.getNodeEnv(),
    version: environment.getApiVersion(),
    config: {
      port: environment.getPort(),
      host: environment.getHost(),
      backendUrl: environment.getBackendUrl(),
      corsOrigins: environment.CORS_ORIGINS,
      rateLimiting: {
        api: {
          windowMs: environment.RATE_LIMIT_WINDOW_MS,
          max: environment.RATE_LIMIT_MAX_REQUESTS
        },
        auth: {
          windowMs: environment.AUTH_RATE_LIMIT_WINDOW_MS,
          max: environment.AUTH_RATE_LIMIT_MAX_REQUESTS
        },
        upload: {
          windowMs: environment.UPLOAD_RATE_LIMIT_WINDOW_MS,
          max: environment.UPLOAD_RATE_LIMIT_MAX_REQUESTS
        }
      }
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
  
  res.status(200).json(detailedHealth);
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start server
const PORT = environment.getPort();
const HOST = environment.getHost();

app.listen(PORT, HOST, () => {
  logger.info('API Gateway started successfully', {
    port: PORT,
    host: HOST,
    environment: environment.getNodeEnv(),
    version: environment.getApiVersion(),
    backendUrl: environment.getBackendUrl(),
    swaggerEnabled: environment.isSwaggerEnabled(),
    urls: {
      api: environment.getApiUrl(),
      health: `${environment.getApiUrl()}/health`,
      docs: environment.isSwaggerEnabled() ? `${environment.getApiUrl()}/api-docs` : 'disabled'
    }
  });
  
  console.log(`🚀 API Gateway running on ${environment.getApiUrl()}`);
  console.log(`🏥 Health check: ${environment.getApiUrl()}/health`);
  
  if (environment.isSwaggerEnabled()) {
    console.log(`📚 API Documentation: ${environment.getApiUrl()}/api-docs`);
  }
  
  console.log(`🔗 Backend service: ${environment.getBackendUrl()}`);
});

export default app;