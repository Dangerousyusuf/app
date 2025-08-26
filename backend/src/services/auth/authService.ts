import generateToken from '../../utils/generateToken';
import { pool } from '../../config/db';
import bcrypt from 'bcryptjs';
import {
  AuthResponse,
  ApiResponse,
  LoginInput,
  RegisterInput,
  UserResponse,
  User,
  AuthServiceInterface,
  DatabaseQueryResult
} from '../../types/auth';

const authenticateUser = async (identifier: string, password: string): Promise<AuthResponse> => {
  try {
    // Kullanıcıyı email, kullanıcı adı veya telefon numarasına göre sorgula
    const userResult: DatabaseQueryResult = await pool.query(
      `SELECT * FROM users WHERE email = $1 OR user_name = $1 OR phone = $1`,
      [identifier]
    );

    // Kullanıcı bulunamadıysa hata fırlat
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user: User = userResult.rows[0] as User;

    // Şifre kontrolü - bcrypt hash karşılaştırması
    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // JWT token oluştur
    const token: string = generateToken(user.user_id);

    const userResponse: UserResponse = {
      id: user.user_id,
      email: user.email,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      gender: user.gender,
      role: user.role,
      profile_picture: user.profile_picture,
    };

    return {
      success: true,
      message: 'Başarıyla giriş yapıldı',
      data: {
        user: userResponse,
        token,
      },
    };
  } catch (error: any) {
    // Özel hataları yeniden fırlat
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      throw error;
    }
    // Veritabanı hatalarını genel bir hata mesajıyla gizle
    console.error('Login service error DETAY:', error.message);
    console.error('Login service error STACK:', error.stack);
    throw new Error('Giriş işlemi sırasında bir hata oluştu');
  }
};

const registerUser = async (userData: RegisterInput): Promise<AuthResponse> => {
  try {
    console.log('registerUser function called, userData:', userData);
    
    const {
      user_name,
      first_name,
      last_name,
      email,
      phone,
      password,
      gender,
      tc,
      birth_date,
      role = 'user'
    } = userData;
    
    // Email kontrolü - aynı email ile kayıt var mı?
    console.log('Checking email:', email);
    const emailCheckResult: DatabaseQueryResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    console.log('Email check result:', emailCheckResult.rows.length);

    if (emailCheckResult.rows.length > 0) {
      console.log('Error: This email address is already in use');
      throw new Error('Bu email adresi zaten kullanılıyor');
    }

    // Kullanıcı adı kontrolü - aynı kullanıcı adı var mı?
    console.log('Checking username:', user_name);
    const usernameCheckResult: DatabaseQueryResult = await pool.query(
      'SELECT * FROM users WHERE user_name = $1',
      [user_name]
    );
    console.log('Username check result:', usernameCheckResult.rows.length);

    if (usernameCheckResult.rows.length > 0) {
      console.log('Error: This username is already in use');
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }

    // Şifreyi hash'leme - bcrypt ile güvenli hashing
    const hashedPassword: string = await bcrypt.hash(password, 12);
    console.log('Password securely hashed');

    // Veritabanı tablosunu kontrol et
    console.log('Checking database table...');
    try {
      const tableCheckResult: DatabaseQueryResult = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
      );
      console.log('Table check result:', tableCheckResult.rows[0]);
      
      if (!tableCheckResult.rows[0].exists) {
        console.log('Users tablosu bulunamadı, tablo oluşturuluyor...');
        // Tablo yoksa oluştur
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            user_id SERIAL PRIMARY KEY,
            user_name VARCHAR(50) UNIQUE NOT NULL,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            password VARCHAR(100) NOT NULL,
            gender VARCHAR(10),
            tc VARCHAR(11),
            birth_date DATE,
            role VARCHAR(20) DEFAULT 'user',
            profile_picture VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Mevcut tabloya profile_picture sütunu ekle (eğer yoksa)
        try {
          await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)
          `);
          console.log('Profile picture sütunu kontrol edildi/eklendi');
        } catch (alterError: any) {
          console.log('Profile picture sütunu zaten mevcut veya ekleme hatası:', alterError.message);
        }
        console.log('Users tablosu başarıyla oluşturuldu');
      }
    } catch (tableError: any) {
      console.error('Tablo kontrolü veya oluşturma hatası:', tableError);
    }
    
    // Kullanıcıyı veritabanına ekle
    console.log('Veritabanına kullanıcı ekleniyor...');
    const insertQuery = `INSERT INTO users (
      user_name, 
      first_name, 
      last_name, 
      email, 
      phone, 
      password, 
      gender, 
      tc, 
      birth_date, 
      role
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING user_id, user_name, first_name, last_name, email, phone, gender, role`;
    
    console.log('SQL Sorgusu:', insertQuery);
    console.log('Parametre değerleri:', [
      user_name,
      first_name,
      last_name,
      email,
      phone,
      hashedPassword,
      gender,
      tc,
      birth_date,
      role
    ]);
    
    let result: DatabaseQueryResult;
    try {
      result = await pool.query(
        insertQuery,
        [
          user_name,
          first_name,
          last_name,
          email,
          phone,
          hashedPassword,
          gender,
          tc,
          birth_date ? new Date(birth_date) : null,
          role
        ]
      );
    } catch (insertError: any) {
      console.error('Kullanıcı ekleme hatası:', insertError.message);
      console.error('Hata detayı:', insertError);
      throw new Error(`Kullanıcı eklenirken hata oluştu: ${insertError.message}`);
    }

    const newUser: User = result.rows[0] as User;
    console.log('Kullanıcı başarıyla eklendi, dönen veri:', newUser);

    // JWT token oluştur
    console.log('JWT token oluşturuluyor, user_id:', newUser.user_id);
    const token: string = generateToken(newUser.user_id);
    console.log('JWT token oluşturuldu');

    const userResponse: UserResponse = {
      id: newUser.user_id,
      user_name: newUser.user_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone: newUser.phone,
      gender: newUser.gender,
      role: newUser.role
    };

    const responseData: AuthResponse = {
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      data: {
        user: userResponse,
        token,
      },
    };
    
    console.log('Dönüş verisi hazırlandı:', responseData);
    return responseData;
  } catch (error: any) {
    // Özel hataları yeniden fırlat
    if (
      error.message === 'Bu email adresi zaten kullanılıyor' ||
      error.message === 'Bu kullanıcı adı zaten kullanılıyor'
    ) {
      throw error;
    }

    // Veritabanı hatalarını genel bir hata mesajıyla gizle
    console.error('Register service error:', error);
    throw new Error('Kayıt işlemi sırasında bir hata oluştu');
  }
};

const getUserById = async (userId: number): Promise<ApiResponse<{ user: UserResponse }>> => {
  try {
    const userResult: DatabaseQueryResult = await pool.query(
      'SELECT user_id, email, user_name, first_name, last_name, phone, gender, role, profile_picture FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const user: User = userResult.rows[0] as User;

    const userResponse: UserResponse = {
      id: user.user_id,
      email: user.email,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      gender: user.gender,
      role: user.role,
      profile_picture: user.profile_picture,
    };

    return {
      success: true,
      message: 'Kullanıcı bilgileri başarıyla alındı',
      data: {
        user: userResponse,
      },
    };
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    throw new Error('Kullanıcı bilgileri alınırken hata oluştu');
  }
};

// Named exports
export {
  authenticateUser,
  registerUser,
  getUserById,
};

// Default export
export default {
  authenticateUser,
  registerUser,
  getUserById,
};

// Service class implementation
class AuthService implements AuthServiceInterface {
  async authenticateUser(identifier: string, password: string): Promise<AuthResponse> {
    return authenticateUser(identifier, password);
  }

  async registerUser(userData: RegisterInput): Promise<AuthResponse> {
    return registerUser(userData);
  }

  async getUserById(userId: number): Promise<ApiResponse<{ user: UserResponse }>> {
    return getUserById(userId);
  }
}

export const authServiceInstance = new AuthService();