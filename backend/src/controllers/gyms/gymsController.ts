import { Response, NextFunction } from 'express';
const { pool } = require('../../config/db');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

import {
  AuthenticatedRequest,
  ApiResponse,
  Gym,
  CreateGymInput,
  UpdateGymInput,
  UpdateGymStatusInput,
  AddClubToGymInput,
  QueryResult,
  ValidationResult
} from '../../types/gyms';

// Tüm salonları getir
export const getAllGyms = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym[]>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const query = `
      SELECT 
        g.id,
        g.name,
        g.phone,
        g.email,
        g.address,
        g.city,
        g.address_line_1,
        g.address_line_2,
        g.postal_code,
        g.timezone,
        g.is_public,
        g.description,
        g.logo,
        g.website,
        g.capacity,
        g.area_sqm,
        g.latitude,
        g.longitude,
        g.status,
        g.created_at,
        g.updated_at,
        -- Club bilgileri (eğer varsa)
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN cgm.id IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'club_id', c.id,
                  'club_name', c.name,
                  'relationship_type', cgm.relationship_type
                )
              ELSE NULL
            END
          ) FILTER (WHERE cgm.id IS NOT NULL),
          '[]'::json
        ) as clubs
      FROM gyms g
      LEFT JOIN clubs_gyms_map cgm ON g.id = cgm.gym_id AND cgm.status = 'active'
      LEFT JOIN clubs c ON cgm.club_id = c.id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;
    
    const result: QueryResult<Gym> = await pool.query(query);
    
    res.status(200).json({
      success: true,
      message: 'Salonlar başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Salonlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Salonlar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// ID'ye göre salon getir
export const getGymById = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        g.id,
        g.name,
        g.phone,
        g.email,
        g.address,
        g.city,
        g.address_line_1,
        g.address_line_2,
        g.postal_code,
        g.timezone,
        g.is_public,
        g.description,
        g.logo,
        g.website,
        g.capacity,
        g.area_sqm,
        g.latitude,
        g.longitude,
        g.status,
        g.created_at,
        g.updated_at,
        COALESCE(
          JSON_AGG(
            CASE 
              WHEN cgm.id IS NOT NULL THEN
                JSON_BUILD_OBJECT(
                  'id', c.id,
                  'club_id', c.id,
                  'name', c.name,
                  'club_name', c.name,
                  'relationship_type', cgm.relationship_type
                )
              ELSE NULL
            END
          ) FILTER (WHERE cgm.id IS NOT NULL),
          '[]'::json
        ) as clubs
      FROM gyms g
      LEFT JOIN clubs_gyms_map cgm ON g.id = cgm.gym_id AND cgm.status = 'active'
      LEFT JOIN clubs c ON cgm.club_id = c.id
      WHERE g.id = $1
      GROUP BY g.id
    `;
    
    const result: QueryResult<Gym> = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Salon bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Salon başarıyla getirildi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Salon getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Salon getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni salon oluştur
export const createGym = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const errors: ValidationResult = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
      return;
    }

    const {
      club_id,
      name,
      phone,
      email,
      address,
      city,
      address_line_1,
      address_line_2,
      postal_code,
      timezone,
      is_public,
      description,
      website,
      capacity,
      area_sqm,
      latitude,
      longitude,
      status = 'active'
    }: CreateGymInput = req.body;

    // Adres bilgilerini birleştir
    const fullAddress = address || [address_line_1, address_line_2, city, postal_code]
      .filter(Boolean)
      .join(', ');

    let logoPath: string | null = null;
    if (req.file) {
      logoPath = req.file.filename;
    }

    const query = `
      INSERT INTO gyms (
        name, phone, email, address, city, address_line_1, address_line_2, 
        postal_code, timezone, is_public, description, logo, website,
        capacity, area_sqm, latitude, longitude, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *
    `;

    const values = [
      name, phone, email, fullAddress, city, address_line_1, address_line_2,
      postal_code, timezone, is_public, description, logoPath, website,
      capacity, area_sqm, latitude, longitude, status
    ];

    const result: QueryResult<Gym> = await pool.query(query, values);
    const newGym: Gym = result.rows[0];

    // Eğer club_id varsa, kulüp-salon ilişkisini kur
    if (club_id) {
      const relationshipQuery = `
        INSERT INTO clubs_gyms_map (club_id, gym_id, relationship_type, created_at)
        VALUES ($1, $2, $3, NOW())
      `;
      
      await pool.query(relationshipQuery, [club_id, newGym.id, 'ownership']);
    }

    res.status(201).json({
      success: true,
      message: 'Salon başarıyla oluşturuldu',
      data: newGym
    });
  } catch (error: any) {
    console.error('Salon oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Salon oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Salon güncelle
export const updateGym = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      address,
      city,
      address_line_1,
      address_line_2,
      postal_code,
      timezone,
      is_public,
      description,
      website,
      capacity,
      area_sqm,
      latitude,
      longitude,
      status
    }: UpdateGymInput = req.body;

    // Adres alanlarından birleştirilmiş adres oluştur
    const fullAddress = address || [address_line_1, address_line_2, city, postal_code]
      .filter(Boolean)
      .join(', ');

    let logoPath: string | null = null;
    if (req.file) {
      logoPath = req.file.filename;
    }

    const query = `
      UPDATE gyms SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        address_line_1 = COALESCE($6, address_line_1),
        address_line_2 = COALESCE($7, address_line_2),
        postal_code = COALESCE($8, postal_code),
        timezone = COALESCE($9, timezone),
        is_public = COALESCE($10, is_public),
        description = COALESCE($11, description),
        logo = COALESCE($12, logo),
        website = COALESCE($13, website),
        capacity = COALESCE($14, capacity),
        area_sqm = COALESCE($15, area_sqm),
        latitude = COALESCE($16, latitude),
        longitude = COALESCE($17, longitude),
        status = COALESCE($18, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *
    `;

    const values = [
      name, phone, email, fullAddress, city, address_line_1, address_line_2, 
      postal_code, timezone, is_public, description, logoPath, website,
      capacity, area_sqm, latitude, longitude, status, id
    ];

    const result: QueryResult<Gym> = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Salon bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Salon başarıyla güncellendi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Salon güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Salon güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Salon sil
export const deleteGym = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Önce salon var mı kontrol et
    const checkQuery = 'SELECT logo FROM gyms WHERE id = $1';
    const checkResult: QueryResult<{ logo: string }> = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Salon bulunamadı'
      });
      return;
    }

    // İlişkili kayıtları sil
    await pool.query('DELETE FROM clubs_gyms_map WHERE gym_id = $1', [id]);

    // Salonu sil
    const deleteQuery = 'DELETE FROM gyms WHERE id = $1 RETURNING *';
    const result: QueryResult<Gym> = await pool.query(deleteQuery, [id]);

    // Logo dosyasını sil
    const gym = checkResult.rows[0];
    if (gym.logo) {
      const logoPath = path.join(__dirname, '../../../uploads/images/gyms', gym.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Salon başarıyla silindi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Salon silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Salon silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Salon durumunu güncelle
export const updateGymStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Gym>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status }: UpdateGymStatusInput = req.body;

    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz durum. Geçerli değerler: active, inactive, maintenance'
      });
      return;
    }

    const query = `
      UPDATE gyms 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;

    const result: QueryResult<Gym> = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Salon bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Salon durumu başarıyla güncellendi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Salon durumu güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Salon durumu güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

export const addClubToGym = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const { id: gymId } = req.params;
    const { club_id, relationship_type }: AddClubToGymInput = req.body;

    // Validasyon
    if (!club_id || !relationship_type) {
      res.status(400).json({
        success: false,
        message: 'Kulüp ID ve ilişki tipi gereklidir'
      });
      return;
    }

    // Geçerli ilişki tipleri
    const validRelationshipTypes = ['ownership', 'partnership', 'franchise'];
    if (!validRelationshipTypes.includes(relationship_type)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ilişki tipi'
      });
      return;
    }

    // Salon ve kulübün var olup olmadığını kontrol et
    const gymCheck: QueryResult<{ id: number }> = await pool.query('SELECT id FROM gyms WHERE id = $1', [parseInt(gymId)]);
    if (gymCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Salon bulunamadı'
      });
      return;
    }

    const clubCheck: QueryResult<{ id: number }> = await pool.query('SELECT id FROM clubs WHERE id = $1', [parseInt(club_id.toString())]);
    if (clubCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Kulüp bulunamadı'
      });
      return;
    }

    // Zaten ilişki var mı kontrol et
    const existingRelation: QueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM clubs_gyms_map WHERE gym_id = $1 AND club_id = $2',
      [parseInt(gymId), parseInt(club_id.toString())]
    );

    if (existingRelation.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Bu kulüp zaten bu salona bağlı'
      });
      return;
    }

    // İlişki ekle
    const insertQuery = `
      INSERT INTO clubs_gyms_map (gym_id, club_id, relationship_type, created_at, status)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'active')
      RETURNING *
    `;

    const result: QueryResult<any> = await pool.query(insertQuery, [parseInt(gymId), parseInt(club_id.toString()), relationship_type]);

    res.status(201).json({
      success: true,
      message: 'Kulüp başarıyla salona eklendi',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Kulüp ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp eklenirken hata oluştu'
    });
  }
};

export const removeClubFromGym = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next?: NextFunction
): Promise<void> => {
  try {
    const { id: gymId, clubId } = req.params;
    
    console.log('removeClubFromGym - req.params:', req.params);
    console.log('removeClubFromGym - gymId:', gymId, 'clubId:', clubId);
    console.log('removeClubFromGym - gymId type:', typeof gymId, 'clubId type:', typeof clubId);
    
    if (!clubId || clubId === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'clubId parametresi gerekli'
      });
      return;
    }

    // İlişkinin var olup olmadığını kontrol et
    const existingRelation: QueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM clubs_gyms_map WHERE gym_id = $1 AND club_id = $2',
      [parseInt(gymId), parseInt(clubId)]
    );

    if (existingRelation.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Bu kulüp bu salona bağlı değil'
      });
      return;
    }

    // İlişkiyi kaldır
    const deleteQuery = 'DELETE FROM clubs_gyms_map WHERE gym_id = $1 AND club_id = $2';
    await pool.query(deleteQuery, [parseInt(gymId), parseInt(clubId)]);

    res.status(200).json({
      success: true,
      message: 'Kulüp başarıyla salondan kaldırıldı'
    });

  } catch (error: any) {
    console.error('Kulüp kaldırma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp kaldırılırken hata oluştu'
    });
  }
};

// Default export
export default {
  getAllGyms,
  getGymById,
  createGym,
  updateGym,
  deleteGym,
  updateGymStatus,
  addClubToGym,
  removeClubFromGym
};