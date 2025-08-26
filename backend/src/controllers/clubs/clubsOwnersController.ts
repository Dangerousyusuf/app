import { Request, Response } from 'express';
import { pool } from '../../config/db';
import { ClubOwner, ClubOwnerCreateRequest, ClubOwnerUpdateRequest } from '../../types/clubs';

// Kulübün sahiplerini getir
export const getClubOwners = async (req: Request<{ clubId: string }>, res: Response): Promise<void> => {
  try {
    const { clubId } = req.params;
    
    const query = `
      SELECT 
        co.id,
        co.club_id,
        co.user_id,
        co.ownership_type,
        co.ownership_percentage,
        co.start_date,
        co.end_date,
        co.status,
        co.created_at,
        co.updated_at,
        u.user_name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.profile_picture
      FROM clubs_owners co
      INNER JOIN users u ON co.user_id = u.user_id
      WHERE co.club_id = $1 AND co.status = 'active'
      ORDER BY co.ownership_percentage DESC, co.created_at ASC
    `;
    
    const result = await pool.query(query, [clubId]);
    
    res.status(200).json({
      success: true,
      message: 'Kulüp sahipleri başarıyla getirildi',
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Kulüp sahipleri getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kulüp sahipleri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kulübe sahip ekle
export const addOwnerToClub = async (req: Request<{ clubId: string }, {}, ClubOwnerCreateRequest>, res: Response): Promise<void> => {
  try {
    const { clubId } = req.params;
    const { user_id, ownership_type, ownership_percentage, start_date } = req.body;

    // Validasyon
    if (!user_id) {
      res.status(400).json({
        success: false,
        message: 'Kullanıcı ID gereklidir'
      });
      return;
    }

    // Geçerli sahiplik tipleri
    const validOwnershipTypes: Array<'owner' | 'co_owner' | 'partner' | 'investor'> = ['owner', 'co_owner', 'partner', 'investor'];
    const ownershipTypeToUse = ownership_type || 'owner';
    
    if (!validOwnershipTypes.includes(ownershipTypeToUse)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz sahiplik tipi'
      });
      return;
    }

    // Sahiplik yüzdesi kontrolü
    const percentageToUse = ownership_percentage || 100.00;
    if (percentageToUse <= 0 || percentageToUse > 100) {
      res.status(400).json({
        success: false,
        message: 'Sahiplik yüzdesi 0-100 arasında olmalıdır'
      });
      return;
    }

    // Kulüp ve kullanıcının var olup olmadığını kontrol et
    const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1', [parseInt(clubId)]);
    if (clubCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Kulüp bulunamadı'
      });
      return;
    }

    const userCheck = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [parseInt(user_id.toString())]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    // Zaten sahiplik var mı kontrol et
    const existingOwnership = await pool.query(
      'SELECT id FROM clubs_owners WHERE club_id = $1 AND user_id = $2',
      [parseInt(clubId), parseInt(user_id.toString())]
    );

    if (existingOwnership.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Bu kullanıcı zaten bu kulübün sahibi'
      });
      return;
    }

    // Sahiplik ekle
    const insertQuery = `
      INSERT INTO clubs_owners (club_id, user_id, ownership_type, ownership_percentage, start_date, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'active', CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const startDateToUse = start_date || new Date().toISOString().split('T')[0];
    const result = await pool.query(insertQuery, [
      parseInt(clubId), 
      parseInt(user_id.toString()), 
      ownershipTypeToUse, 
      percentageToUse,
      startDateToUse
    ]);

    res.status(201).json({
      success: true,
      message: 'Sahip başarıyla kulübe eklendi',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Sahip ekleme hatası:', error);
    
    // Sahiplik yüzdesi aşım hatası
    if (error.message.includes('Total ownership percentage cannot exceed 100%')) {
      res.status(400).json({
        success: false,
        message: 'Toplam sahiplik yüzdesi %100\'ü aşamaz'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Sahip eklenirken hata oluştu',
      error: error.message
    });
  }
};

// Kulüpten sahip kaldır
export const removeOwnerFromClub = async (req: Request<{ clubId: string; ownerId: string }>, res: Response): Promise<void> => {
  try {
    const { clubId, ownerId } = req.params;
    
    if (!ownerId || ownerId === 'undefined') {
      res.status(400).json({
        success: false,
        message: 'Sahip ID parametresi gerekli'
      });
      return;
    }

    // Sahipliğin var olup olmadığını kontrol et
    const existingOwnership = await pool.query(
      'SELECT id FROM clubs_owners WHERE club_id = $1 AND id = $2',
      [parseInt(clubId), parseInt(ownerId)]
    );

    if (existingOwnership.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Bu sahiplik kaydı bulunamadı'
      });
      return;
    }

    // Sahipliği kaldır (soft delete)
    const updateQuery = 'UPDATE clubs_owners SET status = \'inactive\', end_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP WHERE club_id = $1 AND id = $2';
    await pool.query(updateQuery, [parseInt(clubId), parseInt(ownerId)]);

    res.status(200).json({
      success: true,
      message: 'Sahip başarıyla kulüpten kaldırıldı'
    });

  } catch (error: any) {
    console.error('Sahip kaldırma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sahip kaldırılırken hata oluştu',
      error: error.message
    });
  }
};

// Sahiplik bilgilerini güncelle
export const updateOwnership = async (req: Request<{ clubId: string; ownerId: string }, {}, ClubOwnerUpdateRequest>, res: Response): Promise<void> => {
  try {
    const { clubId, ownerId } = req.params;
    const { ownership_type, ownership_percentage } = req.body;

    // Sahipliğin var olup olmadığını kontrol et
    const existingOwnership = await pool.query(
      'SELECT id FROM clubs_owners WHERE club_id = $1 AND id = $2 AND status = \'active\'',
      [parseInt(clubId), parseInt(ownerId)]
    );

    if (existingOwnership.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Bu sahiplik kaydı bulunamadı'
      });
      return;
    }

    let updateFields: string[] = [];
    let updateValues: any[] = [];
    let paramIndex = 1;

    if (ownership_type) {
      const validOwnershipTypes: Array<'owner' | 'co_owner' | 'partner' | 'investor'> = ['owner', 'co_owner', 'partner', 'investor'];
      if (!validOwnershipTypes.includes(ownership_type)) {
        res.status(400).json({
          success: false,
          message: 'Geçersiz sahiplik tipi'
        });
        return;
      }
      updateFields.push(`ownership_type = $${paramIndex}`);
      updateValues.push(ownership_type);
      paramIndex++;
    }

    if (ownership_percentage !== undefined) {
      if (ownership_percentage <= 0 || ownership_percentage > 100) {
        res.status(400).json({
          success: false,
          message: 'Sahiplik yüzdesi 0-100 arasında olmalıdır'
        });
        return;
      }
      updateFields.push(`ownership_percentage = $${paramIndex}`);
      updateValues.push(ownership_percentage);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Güncellenecek alan bulunamadı'
      });
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(parseInt(clubId), parseInt(ownerId));

    const updateQuery = `
      UPDATE clubs_owners 
      SET ${updateFields.join(', ')}
      WHERE club_id = $${paramIndex} AND id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    res.status(200).json({
      success: true,
      message: 'Sahiplik bilgileri başarıyla güncellendi',
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('Sahiplik güncelleme hatası:', error);
    
    // Sahiplik yüzdesi aşım hatası
    if (error.message.includes('Total ownership percentage cannot exceed 100%')) {
      res.status(400).json({
        success: false,
        message: 'Toplam sahiplik yüzdesi %100\'ü aşamaz'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Sahiplik güncellenirken hata oluştu',
      error: error.message
    });
  }
};