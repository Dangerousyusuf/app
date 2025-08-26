import { pool } from '../../config/db';
import {
  User,
  UpdateUserInput,
  ApiResponse,
  UserSearchResponse,
  PaginationInfo,
  Role,
  Permission,
  DatabaseQueryResult,
  UserServiceInterface
} from '../../types/user';

const getAllUsers = async (): Promise<User[]> => {
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
      ORDER BY created_at DESC
    `;
    
    const result: DatabaseQueryResult<User> = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('getAllUsers hatası:', error);
    throw new Error('Kullanıcılar alınırken hata oluştu');
  }
};

const getUserById = async (userId: number): Promise<User | null> => {
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
    
    const result: DatabaseQueryResult<User> = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('getUserById hatası:', error);
    throw new Error('Kullanıcı alınırken hata oluştu');
  }
};

const updateUser = async (userId: number, updateData: UpdateUserInput): Promise<ApiResponse<User>> => {
  try {
    console.log('updateUser çağrıldı:', { userId, updateData });
    
    const allowedFields = ['user_name', 'first_name', 'last_name', 'email', 'phone', 'gender', 'tc', 'birth_date', 'role'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;
    
    // Sadece izin verilen alanları güncelle
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    }
    
    console.log('Update fields:', updateFields);
    console.log('Update values:', updateValues);
    
    if (updateFields.length === 0) {
      return {
        success: false,
        message: 'Güncellenecek geçerli alan bulunamadı'
      };
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`;
    const result: DatabaseQueryResult<any> = await pool.query(query, updateValues);
    
    if (result.rowCount === 0) {
      return {
        success: false,
        message: 'Kullanıcı bulunamadı'
      };
    }
    
    // Güncellenmiş kullanıcı bilgilerini al
    const updatedUser = await getUserById(userId);
    
    return {
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: updatedUser!
    };
  } catch (error) {
    console.error('updateUser hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Kullanıcı güncellenirken hata oluştu'
    };
  }
};

const deleteUser = async (userId: number): Promise<ApiResponse<any>> => {
  try {
    const query = 'DELETE FROM users WHERE user_id = $1';
    const result: DatabaseQueryResult<any> = await pool.query(query, [userId]);
    
    if (result.rowCount === 0) {
      return {
        success: false,
        message: 'Kullanıcı bulunamadı'
      };
    }
    
    return {
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    };
  } catch (error) {
    console.error('deleteUser hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Kullanıcı silinirken hata oluştu'
    };
  }
};

const searchUsers = async (query: string, page: number = 1, limit: number = 10): Promise<UserSearchResponse> => {
  try {
    const offset = (page - 1) * limit;
    
    let sqlQuery: string, countQuery: string, params: any[];
    
    if (!query || query.trim() === '') {
      // Boş arama - tüm kullanıcıları getir
      sqlQuery = `SELECT user_id, user_name, email, first_name, last_name, 
                         profile_picture, phone, gender, created_at, updated_at
                  FROM users 
                  ORDER BY created_at DESC
                  LIMIT $1 OFFSET $2`;
      countQuery = `SELECT COUNT(*) as total FROM users`;
      params = [limit, offset];
    } else {
      // Normal arama
      const searchPattern = `%${query}%`;
      sqlQuery = `SELECT user_id, user_name, email, first_name, last_name, 
                         profile_picture, phone, gender, created_at, updated_at
                  FROM users 
                  WHERE (user_name ILIKE $1 OR email ILIKE $1 OR 
                         first_name ILIKE $1 OR last_name ILIKE $1)
                  ORDER BY created_at DESC
                  LIMIT $2 OFFSET $3`;
      countQuery = `SELECT COUNT(*) as total
                    FROM users 
                    WHERE (user_name ILIKE $1 OR email ILIKE $1 OR 
                           first_name ILIKE $1 OR last_name ILIKE $1)`;
      params = [searchPattern, limit, offset];
    }
    
    const result: DatabaseQueryResult<User> = await pool.query(sqlQuery, params);

    const countResult: DatabaseQueryResult<{ total: string }> = await pool.query(
      countQuery,
      !query || query.trim() === '' ? [] : [params[0]]
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationInfo = {
      page: parseInt(page.toString()),
      limit: parseInt(limit.toString()),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return {
      users: result.rows,
      pagination
    };
  } catch (error) {
    throw error;
  }
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result: DatabaseQueryResult<User> = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// Kullanıcının rollerini getir
const getUserRoles = async (userId: number): Promise<Role[]> => {
  try {
    const query = `
      SELECT r.id, r.name, r.description, r.created_at
      FROM roles r
      INNER JOIN roles_users_map rum ON r.id = rum.role_id
      WHERE rum.user_id = $1
      ORDER BY r.name
    `;
    
    const result: DatabaseQueryResult<Role> = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('getUserRoles hatası:', error);
    throw new Error('Kullanıcı rolleri alınırken hata oluştu');
  }
};

// Kullanıcıya rol ata
const assignRoleToUser = async (userId: number, roleId: number): Promise<ApiResponse<any>> => {
  try {
    // Önce bu ilişkinin zaten var olup olmadığını kontrol et
    const existingQuery = 'SELECT * FROM roles_users_map WHERE user_id = $1 AND role_id = $2';
    const existingResult: DatabaseQueryResult<any> = await pool.query(existingQuery, [userId, roleId]);
    
    if (existingResult.rows.length > 0) {
      return {
        success: false,
        message: 'Bu rol zaten kullanıcıya atanmış'
      };
    }
    
    const insertQuery = 'INSERT INTO roles_users_map (user_id, role_id) VALUES ($1, $2)';
    await pool.query(insertQuery, [userId, roleId]);
    
    return {
      success: true,
      message: 'Rol başarıyla kullanıcıya atandı'
    };
  } catch (error) {
    console.error('assignRoleToUser hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Rol atanırken hata oluştu'
    };
  }
};

// Kullanıcıdan rol kaldır
const removeRoleFromUser = async (userId: number, roleId: number): Promise<ApiResponse<any>> => {
  try {
    const deleteQuery = 'DELETE FROM roles_users_map WHERE user_id = $1 AND role_id = $2';
    const result: DatabaseQueryResult<any> = await pool.query(deleteQuery, [userId, roleId]);
    
    if (result.rowCount === 0) {
      return {
        success: false,
        message: 'Bu rol kullanıcıya atanmamış'
      };
    }
    
    return {
      success: true,
      message: 'Rol başarıyla kullanıcıdan kaldırıldı'
    };
  } catch (error) {
    console.error('removeRoleFromUser hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Rol kaldırılırken hata oluştu'
    };
  }
};

// Kullanıcının tüm rollerini güncelle
const updateUserRoles = async (userId: number, roleIds: number[]): Promise<ApiResponse<any>> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Önce mevcut rolleri sil
    await client.query('DELETE FROM roles_users_map WHERE user_id = $1', [userId]);
    
    // Yeni rolleri ekle
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        await client.query(
          'INSERT INTO roles_users_map (user_id, role_id) VALUES ($1, $2)',
          [userId, roleId]
        );
      }
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      message: 'Kullanıcı rolleri başarıyla güncellendi'
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updateUserRoles hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Kullanıcı rolleri güncellenirken hata oluştu'
    };
  } finally {
    client.release();
  }
};

// Kullanıcının izinlerini getir
const getUserPermissions = async (userId: number): Promise<ApiResponse<Permission[]>> => {
  try {
    const query = `
      SELECT p.id, p.key, p.description, p.module
      FROM permissions p
      INNER JOIN user_permissions_map upm ON p.id = upm.permission_id
      WHERE upm.user_id = $1
      ORDER BY p.module, p.key
    `;
    
    const result: DatabaseQueryResult<Permission> = await pool.query(query, [userId]);
    
    return {
      success: true,
      message: 'Kullanıcı izinleri başarıyla getirildi',
      data: result.rows
    };
  } catch (error) {
    console.error('getUserPermissions hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Kullanıcı izinleri getirilirken hata oluştu'
    };
  }
};

// Kullanıcıya izin ata
const assignPermissionToUser = async (userId: number, permissionId: number): Promise<ApiResponse<any>> => {
  try {
    // Önce bu ilişkinin zaten var olup olmadığını kontrol et
    const existingQuery = 'SELECT * FROM user_permissions_map WHERE user_id = $1 AND permission_id = $2';
    const existingResult: DatabaseQueryResult<any> = await pool.query(existingQuery, [userId, permissionId]);
    
    if (existingResult.rows.length > 0) {
      return {
        success: false,
        message: 'Bu izin zaten kullanıcıya atanmış'
      };
    }
    
    const insertQuery = 'INSERT INTO user_permissions_map (user_id, permission_id) VALUES ($1, $2)';
    await pool.query(insertQuery, [userId, permissionId]);
    
    return {
      success: true,
      message: 'İzin başarıyla kullanıcıya atandı'
    };
  } catch (error) {
    console.error('assignPermissionToUser hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'İzin atanırken hata oluştu'
    };
  }
};

// Kullanıcıdan izin kaldır
const removePermissionFromUser = async (userId: number, permissionId: number): Promise<ApiResponse<any>> => {
  try {
    const deleteQuery = 'DELETE FROM user_permissions_map WHERE user_id = $1 AND permission_id = $2';
    const result: DatabaseQueryResult<any> = await pool.query(deleteQuery, [userId, permissionId]);
    
    if (result.rowCount === 0) {
      return {
        success: false,
        message: 'Bu izin kullanıcıya atanmamış'
      };
    }
    
    return {
      success: true,
      message: 'İzin başarıyla kullanıcıdan kaldırıldı'
    };
  } catch (error) {
    console.error('removePermissionFromUser hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'İzin kaldırılırken hata oluştu'
    };
  }
};

// Kullanıcının tüm izinlerini güncelle
const updateUserPermissions = async (userId: number, permissionIds: number[]): Promise<ApiResponse<any>> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Önce mevcut izinleri sil
    await client.query('DELETE FROM user_permissions_map WHERE user_id = $1', [userId]);
    
    // Yeni izinleri ekle
    if (permissionIds && permissionIds.length > 0) {
      for (const permissionId of permissionIds) {
        await client.query(
          'INSERT INTO user_permissions_map (user_id, permission_id) VALUES ($1, $2)',
          [userId, permissionId]
        );
      }
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      message: 'Kullanıcı izinleri başarıyla güncellendi'
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updateUserPermissions hatası:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Kullanıcı izinleri güncellenirken hata oluştu'
    };
  } finally {
    client.release();
  }
};

export const userService: UserServiceInterface = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  getUserByEmail,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  updateUserRoles,
  getUserPermissions,
  assignPermissionToUser,
  removePermissionFromUser,
  updateUserPermissions,
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  getUserByEmail,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  updateUserRoles,
  getUserPermissions,
  assignPermissionToUser,
  removePermissionFromUser,
  updateUserPermissions,
};

export default userService;