import { Response } from 'express';
import { validationResult } from 'express-validator';
import { pool } from '../../config/db';
import {
  AuthenticatedPermissionRequest,
  AuthenticatedUpdatePermissionRequest,
  AuthenticatedGetPermissionRequest,
  AuthenticatedGetPermissionsByModuleRequest,
  PermissionResponse,
  PermissionsListResponse,
  PermissionQueryResult,
  SinglePermissionQueryResult,
  Permission
} from '../../types/permissions';

// Tüm izinleri getir
export const getAllPermissions = async (req: AuthenticatedGetPermissionRequest, res: Response<PermissionsListResponse>): Promise<void> => {
  try {
    const query = `
      SELECT id, key, description, module, created_at
      FROM permissions
      ORDER BY module, key
    `;
    
    const result: PermissionQueryResult = await pool.query(query);
    
    res.status(200).json({
      success: true,
      message: 'İzinler başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('İzinler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İzinler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// ID ile izin getir
export const getPermissionById = async (req: AuthenticatedGetPermissionRequest, res: Response<PermissionResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, key, description, module, created_at
      FROM permissions
      WHERE id = $1
    `;
    
    const result: SinglePermissionQueryResult = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'İzin başarıyla getirildi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('İzin getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İzin getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni izin oluştur
export const createPermission = async (req: AuthenticatedPermissionRequest, res: Response<PermissionResponse>): Promise<void> => {
  try {
    console.log('createPermission çağrıldı, req.body:', req.body);
    
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation hataları:', errors.array());
      res.status(400).json({
        success: false,
        message: 'Geçersiz veri',
        errors: errors.array()
      } as any);
      return;
    }
    
    const { key, description, module } = req.body;
    
    // Aynı key'e sahip izin var mı kontrol et
    const checkQuery = 'SELECT id FROM permissions WHERE key = $1';
    const checkResult: SinglePermissionQueryResult = await pool.query(checkQuery, [key]);
    
    if (checkResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Bu izin anahtarı zaten mevcut'
      });
      return;
    }
    
    const insertQuery = `
      INSERT INTO permissions (key, description, module)
      VALUES ($1, $2, $3)
      RETURNING id, key, description, module, created_at
    `;
    
    const result: SinglePermissionQueryResult = await pool.query(insertQuery, [key, description, module]);
    
    res.status(201).json({
      success: true,
      message: 'İzin başarıyla oluşturuldu',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('İzin oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İzin oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// İzin güncelle
export const updatePermission = async (req: AuthenticatedUpdatePermissionRequest, res: Response<PermissionResponse>): Promise<void> => {
  try {
    // Validation hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz veri',
        errors: errors.array()
      } as any);
      return;
    }
    
    const { id } = req.params;
    const { key, description, module } = req.body;
    
    // İzin var mı kontrol et
    const checkQuery = 'SELECT id FROM permissions WHERE id = $1';
    const checkResult: SinglePermissionQueryResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
      return;
    }
    
    // Aynı key'e sahip başka izin var mı kontrol et (kendisi hariç)
    const keyCheckQuery = 'SELECT id FROM permissions WHERE key = $1 AND id != $2';
    const keyCheckResult: SinglePermissionQueryResult = await pool.query(keyCheckQuery, [key, id]);
    
    if (keyCheckResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Bu izin anahtarı zaten mevcut'
      });
      return;
    }
    
    const updateQuery = `
      UPDATE permissions
      SET key = $1, description = $2, module = $3
      WHERE id = $4
      RETURNING id, key, description, module, created_at
    `;
    
    const result: SinglePermissionQueryResult = await pool.query(updateQuery, [key, description, module, id]);
    
    res.status(200).json({
      success: true,
      message: 'İzin başarıyla güncellendi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('İzin güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İzin güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// İzin sil
export const deletePermission = async (req: AuthenticatedGetPermissionRequest, res: Response<PermissionResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    
    // İzin var mı kontrol et
    const checkQuery = 'SELECT id, key FROM permissions WHERE id = $1';
    const checkResult: SinglePermissionQueryResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'İzin bulunamadı'
      });
      return;
    }
    
    const deleteQuery = 'DELETE FROM permissions WHERE id = $1';
    await pool.query(deleteQuery, [id]);
    
    res.status(200).json({
      success: true,
      message: 'İzin başarıyla silindi'
    });
  } catch (error: any) {
    console.error('İzin silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İzin silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Modüle göre izinleri getir
export const getPermissionsByModule = async (req: AuthenticatedGetPermissionsByModuleRequest, res: Response<PermissionsListResponse>): Promise<void> => {
  try {
    const { module } = req.params;
    
    const query = `
      SELECT id, key, description, module, created_at
      FROM permissions
      WHERE module = $1
      ORDER BY key
    `;
    
    const result: PermissionQueryResult = await pool.query(query, [module]);
    
    res.status(200).json({
      success: true,
      message: 'Modül izinleri başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Modül izinleri getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Modül izinleri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Named exports
export {
  getAllPermissions as default
};