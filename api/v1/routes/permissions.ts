import express from 'express';
import { Request, Response } from 'express';
import { proxyRequest } from '../../utils/httpClient';
import { urlUtils } from '../config/urls';

const router = express.Router();

// Tüm izinleri getir
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await proxyRequest({
      method: 'GET',
      url: urlUtils.getBackendApiUrl('/permissions'),
      headers: req.headers
    });
    
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('İzinler getirme hatası:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'İzinler getirilirken bir hata oluştu';
    
    return responseFormatter.error(res, errorMessage, statusCode);
  }
});

// ID ile izin getir
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await proxyRequest({
      method: 'GET',
      url: urlUtils.getBackendApiUrl(`/permissions/${id}`),
      headers: req.headers
    });
    
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('İzin getirme hatası:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'İzin getirilirken bir hata oluştu';
    
    return responseFormatter.error(res, errorMessage, statusCode);
  }
});

// Modüle göre izinleri getir
router.get('/module/:module', async (req: Request, res: Response) => {
  try {
    const { module } = req.params;
    const response = await proxyRequest({
      method: 'GET',
      url: urlUtils.getBackendApiUrl(`/permissions/module/${module}`),
      headers: req.headers
    });
    
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Modül izinleri getirme hatası:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'Modül izinleri getirilirken bir hata oluştu';
    
    return responseFormatter.error(res, errorMessage, statusCode);
  }
});

// Yeni izin oluştur
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await proxyRequest({
      method: 'POST',
      url: urlUtils.getBackendApiUrl('/permissions'),
      headers: req.headers,
      data: req.body
    });
    
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('İzin oluşturma hatası:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'İzin oluşturulurken bir hata oluştu';
    
    return responseFormatter.error(res, errorMessage, statusCode);
  }
});

// İzin güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await proxyRequest({
      method: 'PUT',
      url: urlUtils.getBackendApiUrl(`/permissions/${id}`),
      headers: req.headers,
      data: req.body
    });
    
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('İzin güncelleme hatası:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'İzin güncellenirken bir hata oluştu';
    
    return responseFormatter.error(res, errorMessage, statusCode);
  }
});

// İzin sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await proxyRequest({
      method: 'DELETE',
      url: urlUtils.getBackendApiUrl(`/permissions/${id}`),
      headers: req.headers
    });
    
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('İzin silme hatası:', error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'İzin silinirken bir hata oluştu';
    
    return responseFormatter.error(res, errorMessage, statusCode);
  }
});

export default router;