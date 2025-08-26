import { Request, Response } from 'express';
import { pool } from '../../config/db';
import path from 'path';
import fs from 'fs';
import { 
  Club, 
  ClubCreateRequest, 
  ClubUpdateRequest, 
  ClubStatusUpdateRequest,
  ClubGym 
} from '../../types/clubs';

// Get all clubs
export const getAllClubs = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT 
        id,
        name,
        phone,
        email,
        address,
        description,
        logo,
        status,
        created_at,
        updated_at
      FROM clubs 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Get all clubs error:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüpler getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Connect gym to club
export const connectGym = async (req: Request<{ id: string }, {}, { gymId: string; relationship: string }>, res: Response): Promise<void> => {
  try {
    const { id: clubId } = req.params;
    const { gymId, relationship } = req.body;
    
    // Check if the relationship already exists
    const checkQuery = 'SELECT * FROM clubs_gyms_map WHERE club_id = $1 AND gym_id = $2';
    const checkResult = await pool.query(checkQuery, [clubId, gymId]);
    
    if (checkResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Bu kulüp ve salon arasında zaten bağlantı mevcut'
      });
      return;
    }
    
    // Create the relationship
    const insertQuery = 'INSERT INTO clubs_gyms_map (club_id, gym_id, relationship_type, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *';
    const result = await pool.query(insertQuery, [clubId, gymId, relationship]);
    
    res.status(201).json({
      success: true,
      message: 'Salon kulübe başarıyla bağlandı',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Connect gym error:', error);
    res.status(500).json({
      success: false,
      message: 'Salon bağlanırken hata oluştu',
      error: error.message
    });
  }
};

// Disconnect gym from club
export const disconnectGym = async (req: Request<{ id: string; gymId: string }>, res: Response): Promise<void> => {
  try {
    const { id: clubId, gymId } = req.params;
    
    console.log('disconnectGym - clubId:', clubId, 'gymId:', gymId);
    
    // Check if the relationship exists
    const existingRelation = await pool.query(
      'SELECT id FROM clubs_gyms_map WHERE club_id = $1 AND gym_id = $2',
      [parseInt(clubId), parseInt(gymId)]
    );

    if (existingRelation.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Bu salon bu kulübe bağlı değil'
      });
      return;
    }

    // Remove the relationship
    const deleteQuery = 'DELETE FROM clubs_gyms_map WHERE club_id = $1 AND gym_id = $2';
    await pool.query(deleteQuery, [parseInt(clubId), parseInt(gymId)]);

    res.status(200).json({
      success: true,
      message: 'Salon başarıyla kulüpten kaldırıldı'
    });

  } catch (error: any) {
    console.error('Disconnect gym error:', error);
    res.status(500).json({
      success: false,
      message: 'Salon kaldırılırken hata oluştu',
      error: error.message
    });
  }
};

// Get club by ID
export const getClubById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        name,
        phone,
        email,
        address,
        description,
        logo,
        status,
        created_at,
        updated_at
      FROM clubs 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Kulüp bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Get club by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Create new club
export const createClub = async (req: Request<{}, {}, ClubCreateRequest>, res: Response): Promise<void> => {
  try {
    const { name, phone, email, address, description, logo, status = 'active' } = req.body;
    
    // Validation
    if (!name || !phone || !email) {
      res.status(400).json({
        success: false,
        message: 'Kulüp adı, telefon ve email zorunludur'
      });
      return;
    }
    
    const query = `
      INSERT INTO clubs (name, phone, email, address, description, logo, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, phone, email, address, description, logo, status]);
    
    res.status(201).json({
      success: true,
      message: 'Kulüp başarıyla oluşturuldu',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Create club error:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Update club
export const updateClub = async (req: Request<{ id: string }, {}, ClubUpdateRequest>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, description, logo, status } = req.body;
    
    const query = `
      UPDATE clubs 
      SET 
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        address = COALESCE($4, address),
        description = COALESCE($5, description),
        logo = COALESCE($6, logo),
        status = COALESCE($7, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, phone, email, address, description, logo, status, id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Kulüp bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Kulüp başarıyla güncellendi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update club error:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Delete club
export const deleteClub = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM clubs WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Kulüp bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Kulüp başarıyla silindi'
    });
  } catch (error: any) {
    console.error('Delete club error:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp silinirken hata oluştu',
      error: error.message
    });
  }
};

// Update club status
export const updateClubStatus = async (req: Request<{ id: string }, {}, ClubStatusUpdateRequest>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Geçerli bir durum belirtiniz (active/inactive)'
      });
      return;
    }
    
    const query = `
      UPDATE clubs 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Kulüp bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Kulüp durumu başarıyla güncellendi',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update club status error:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp durumu güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Upload club logo
export const uploadClubLogo = async (req: Request & { file?: any }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Logo dosyası yüklenmedi'
      });
      return;
    }

    // Kulübün var olup olmadığını kontrol et
    const clubCheck = await pool.query('SELECT logo FROM clubs WHERE id = $1', [id]);
    
    if (clubCheck.rows.length === 0) {
      // Yüklenen dosyayı sil
      fs.unlinkSync(req.file.path);
      res.status(404).json({
        success: false,
        message: 'Kulüp bulunamadı'
      });
      return;
    }

    const oldLogo = clubCheck.rows[0].logo;
    const newLogoPath = req.file.filename;

    // Veritabanını güncelle
    const updateQuery = `
      UPDATE clubs 
      SET logo = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, name, logo
    `;
    
    const result = await pool.query(updateQuery, [newLogoPath, id]);

    // Eski logo dosyasını sil (varsa)
    if (oldLogo) {
      const oldLogoPath = path.join(__dirname, '../../../uploads/images/logos', oldLogo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logo başarıyla güncellendi',
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        logo: result.rows[0].logo,
        logoUrl: `/uploads/images/logos/${result.rows[0].logo}`
      }
    });

  } catch (error: any) {
    console.error('Upload club logo hatası:', error);
    
    // Hata durumunda yüklenen dosyayı sil
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Logo yüklenirken hata oluştu',
      error: error.message
    });
  }
};

// Get gyms by club ID
export const getGymsByClubId = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id: clubId } = req.params;
    
    const query = `
      SELECT 
        g.id,
        g.name,
        g.phone,
        g.email,
        g.address,
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
        cgm.relationship_type
      FROM gyms g
      INNER JOIN clubs_gyms_map cgm ON g.id = cgm.gym_id
      WHERE cgm.club_id = $1 AND cgm.status = 'active'
      ORDER BY g.created_at DESC
    `;
    
    const result = await pool.query(query, [clubId]);
    
    res.status(200).json({
      success: true,
      message: 'Kulübe bağlı salonlar başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Get gyms by club ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Kulübe bağlı salonlar getirilirken hata oluştu',
      error: error.message
    });
  }
};