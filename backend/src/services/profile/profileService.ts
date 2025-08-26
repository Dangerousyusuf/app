import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { User, UpdateProfilePictureResult, ProfileServiceInterface } from '../../types/profile';

const { pool }: { pool: Pool } = require('../../config/db');

const getUserProfile = async (userId: number): Promise<User | null> => {
  try {
    const query = `
      SELECT 
        user_id as id,
        user_name,
        first_name,
        last_name,
        email,
        phone,
        gender,
        tc,
        birth_date,
        role,
        profile_picture,
        created_at,
        updated_at
      FROM users 
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0] as User;
    
    // Şifreyi response'dan çıkar
    delete (user as any).password;
    
    return user;
  } catch (error) {
    console.error('getUserProfile hatası:', error);
    throw new Error('Kullanıcı profili alınırken hata oluştu');
  }
};

const updateProfilePicture = async (userId: number, profilePicturePath: string): Promise<UpdateProfilePictureResult> => {
  try {
    // Önce mevcut profil resmini al
    const getCurrentPictureQuery = 'SELECT profile_picture FROM users WHERE user_id = $1';
    const currentResult = await pool.query(getCurrentPictureQuery, [userId]);
    
    if (currentResult.rowCount === 0) {
      throw new Error('Kullanıcı bulunamadı');
    }
    
    const currentProfilePicture: string | null = currentResult.rows[0].profile_picture;
    
    // Yeni profil resmini güncelle
    const query = 'UPDATE users SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING profile_picture';
    const result = await pool.query(query, [profilePicturePath, userId]);
    
    // Eski profil resmini sil (eğer default.jpg değilse ve null değilse)
    if (currentProfilePicture && currentProfilePicture !== 'default.jpg') {
      const oldImagePath = path.join(__dirname, '../../../uploads/images/avatars', currentProfilePicture);
      
      // Dosya varsa sil
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
          console.log(`Eski profil resmi silindi: ${currentProfilePicture}`);
        } catch (deleteError) {
          console.error('Eski profil resmi silinirken hata:', deleteError);
          // Silme hatası olsa bile devam et
        }
      }
    }
    
    return {
      success: true,
      message: 'Profil resmi başarıyla güncellendi',
      data: {
        profile_picture: result.rows[0].profile_picture
      }
    };
  } catch (error) {
    console.error('updateProfilePicture hatası:', error);
    throw new Error('Profil resmi güncellenirken hata oluştu');
  }
};

const profileService: ProfileServiceInterface = {
  getUserProfile,
  updateProfilePicture,
};

export default profileService;
export { getUserProfile, updateProfilePicture };