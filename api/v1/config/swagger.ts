import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application, Request, Response } from 'express';
import { API_GATEWAY_URLS } from './urls';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gateway',
      version: '1.0.0',
      description: 'API Gateway for microservices'
    },
    servers: [
      {
        url: API_GATEWAY_URLS.DEV_BASE,
        description: 'Development server'
      },
      {
        url: API_GATEWAY_URLS.PROD_BASE,
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './v1/routes/*.ts',
    './v1/routes/**/*.ts',
    './v1/controllers/*.ts',
    './v1/controllers/**/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export default (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation'
  }));
  
  // JSON endpoint for API specs
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};