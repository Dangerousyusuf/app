import express, { Request, Response } from 'express';
import { logger } from '../../../utils/logger';
import { getHttpClient } from '../../../utils/httpClient';
const httpClient = getHttpClient();
import responseFormatter from '../../../utils/responseFormatter';

const router = express.Router();

// POST /roles - Yeni rol oluştur
router.post('/', async (req: Request, res: Response) => {
  try {
    logger.info('Create role request', { 
      ip: req.ip,
      body: req.body 
    });

    // Backend'e istek gönder
    const response = await httpClient.post('/roles', req.body, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });

    logger.info('Role created successfully', { roleId: response.data?.data?.id });
    return responseFormatter.success(res, response.data.data, response.data.message, 201);

  } catch (error: any) {
    logger.error('Create role error', { 
      error: error.message
    });

    // HttpClient handleError fonksiyonu error.response'u kaldırıp yeni yapı döndürüyor
    if (error.type === 'HTTP_ERROR') {
      const statusCode = error.status;
      const message = error.message || 'Rol oluşturulurken hata oluştu';
      return responseFormatter.error(res, message, statusCode);
    }

    return responseFormatter.error(res, 'Sunucu hatası', 500);
  }
});

// GET /roles - Rolleri listele
router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('Get roles request', { 
      ip: req.ip,
      query: req.query 
    });

    // Backend'e istek gönder
    const response = await httpClient.get('/roles', {
      headers: {
        'Authorization': req.headers.authorization
      },
      params: req.query
    });

    logger.info('Roles retrieved successfully', { count: response.data?.data?.length });
    return responseFormatter.success(res, response.data.data, response.data.message);

  } catch (error: any) {
    logger.error('Get roles error', { 
      error: error.message,
      stack: error.stack,
      response: error.response?.data 
    });

    if (error.response) {
      const statusCode = error.response.status;
      const message = error.response.data?.message || 'Roller yüklenirken hata oluştu';
      return responseFormatter.error(res, message, statusCode);
    }

    return responseFormatter.error(res, 'Sunucu hatası', 500);
  }
});

// DELETE /roles/:id - Rol sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    logger.info('Delete role request', { 
      ip: req.ip,
      roleId: req.params.id 
    });

    // Backend'e istek gönder
    const response = await httpClient.delete(`/roles/${req.params.id}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });

    logger.info('Role deleted successfully', { roleId: req.params.id });
    return responseFormatter.success(res, response.data.data, response.data.message);

  } catch (error: any) {
    logger.error('Delete role error', { 
      error: error.message,
      roleId: req.params.id
    });

    // HttpClient handleError fonksiyonu error.response'u kaldırıp yeni yapı döndürüyor
    if (error.type === 'HTTP_ERROR') {
      const statusCode = error.status;
      const message = error.message || 'Rol silinirken hata oluştu';
      return responseFormatter.error(res, message, statusCode);
    }

    return responseFormatter.error(res, 'Sunucu hatası', 500);
  }
});

export default router;