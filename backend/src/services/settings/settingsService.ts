import { pool } from '../../config/db';
import { ApiResponse } from '../../types/auth';

// User Settings interface
export interface UserSettings {
  setting_id: number;
  user_id: number;
  theme: 'light' | 'dark';
  language: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Database query result interface
interface DatabaseQueryResult<T> {
  rows: T[];
  rowCount: number;
}

const updateUserTheme = async (userId: number, theme: 'light' | 'dark'): Promise<ApiResponse<UserSettings>> => {
  try {
    const query = `
      UPDATE users_settings 
      SET theme = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $2 
      RETURNING *
    `;
    
    const result: DatabaseQueryResult<UserSettings> = await pool.query(query, [theme, userId]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Kullanıcı ayarları bulunamadı'
      };
    }
    
    return {
      success: true,
      message: 'Tema başarıyla güncellendi',
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Update user theme service hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

const getUserSettings = async (userId: number): Promise<ApiResponse<UserSettings>> => {
  try {
    const query = `
      SELECT setting_id, user_id, theme, language, is_active, created_at, updated_at
      FROM users_settings 
      WHERE user_id = $1
    `;
    
    const result: DatabaseQueryResult<UserSettings> = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Kullanıcı ayarları bulunamadı'
      };
    }
    
    return {
      success: true,
      message: 'Kullanıcı ayarları başarıyla alındı',
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Get user settings service hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

export const settingsService = {
  updateUserTheme,
  getUserSettings
};

export {
  updateUserTheme,
  getUserSettings
};

export default settingsService;