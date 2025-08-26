import { Response } from 'express';
import { pool } from '../../config/db';
import {
  Role,
  CreateRoleInput,
  UpdateRoleInput,
  ApiResponse,
  AuthenticatedRequest,
  Permission,
  UpdateRolePermissionsInput,
  DatabaseQueryResult
} from '../../types/roles';

// Yeni rol oluştur
const createRole = async (req: AuthenticatedRequest, res: Response<ApiResponse<Role>>): Promise<Response> => {
  try {
    const { name, description, permission_ids }: CreateRoleInput = req.body;

    // Validasyon
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Rol adı gereklidir'
      });
    }

    // Rol adının benzersiz olup olmadığını kontrol et
    const existingRole: DatabaseQueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [name]
    );

    if (existingRole.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu rol adı zaten kullanılıyor'
      });
    }

    // Transaction başlat
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Yeni rol oluştur
      const result: DatabaseQueryResult<Role> = await client.query(
        'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
        [name, description || null]
      );

      const newRole: Role = result.rows[0];
      
      // Eğer izinler varsa role_permissions_map tablosuna ekle
      if (permission_ids && Array.isArray(permission_ids) && permission_ids.length > 0) {
        for (const permissionId of permission_ids) {
          await client.query(
            'INSERT INTO role_permissions_map (role_id, permission_id) VALUES ($1, $2)',
            [newRole.id, permissionId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      return res.status(201).json({
        success: true,
        message: 'Rol başarıyla oluşturuldu',
        data: newRole
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Rol oluşturulurken hata oluştu'
    });
  }
};

// Rolleri listele
const getRoles = async (req: AuthenticatedRequest, res: Response<ApiResponse<{ roles: Role[] }>>): Promise<Response> => {
  try {
    console.log('=== GET ROLES BAŞLADI ===');
    console.log('getRoles çağrıldı, query params:', req.query);

    // Tüm rolleri getir (pagination olmadan)
    const result: DatabaseQueryResult<Role> = await pool.query(
      'SELECT * FROM roles ORDER BY created_at DESC'
    );
    console.log('Roles result:', result.rows);

    const roles: Role[] = result.rows;

    return res.status(200).json({
      success: true,
      message: 'Roller başarıyla getirildi',
      data: {
        roles
      }
    });

  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Roller yüklenirken hata oluştu'
    });
  }
};

// Rol güncelle
const updateRole = async (req: AuthenticatedRequest, res: Response<ApiResponse<Role>>): Promise<Response> => {
  try {
    console.log('=== UPDATE ROLE BAŞLADI ===');
    console.log('updateRole çağrıldı, params:', req.params, 'body:', req.body);
    const { id } = req.params;
    const { name, description }: UpdateRoleInput = req.body;

    // Validasyon
    if (!name || !description) {
      console.log('Validation hatası: name veya description eksik');
      return res.status(400).json({
        success: false,
        message: 'Rol adı ve açıklaması gereklidir'
      });
    }

    // Rolün var olup olmadığını kontrol et
    console.log('Rol varlığı kontrol ediliyor, id:', id);
    const existingRole: DatabaseQueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );
    console.log('Existing role result:', existingRole.rows);

    if (existingRole.rows.length === 0) {
      console.log('Rol bulunamadı');
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    // Aynı isimde başka rol var mı kontrol et (kendisi hariç)
    console.log('Duplicate kontrol ediliyor, name:', name, 'id:', id);
    const duplicateRole: DatabaseQueryResult<{ id: number }> = await pool.query(
      'SELECT id FROM roles WHERE name = $1 AND id != $2',
      [name, id]
    );
    console.log('Duplicate role result:', duplicateRole.rows);

    if (duplicateRole.rows.length > 0) {
      console.log('Bu rol adı zaten kullanılıyor');
      return res.status(409).json({
        success: false,
        message: 'Bu rol adı zaten kullanılıyor'
      });
    }

    // Rolü güncelle
    console.log('Rol güncelleniyor...');
    const result: DatabaseQueryResult<Role> = await pool.query(
      'UPDATE roles SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    console.log('Update result:', result.rows);

    const updatedRole: Role = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Rol başarıyla güncellendi',
      data: updatedRole
    });

  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Rol güncellenirken hata oluştu'
    });
  }
};

// Rol sil
const deleteRole = async (req: AuthenticatedRequest, res: Response<ApiResponse<Role>>): Promise<Response> => {
  try {
    console.log('=== DELETE ROLE BAŞLADI ===');
    console.log('deleteRole çağrıldı, params:', req.params);
    const { id } = req.params;

    // ID geçerliliği kontrolü
    if (!id || isNaN(Number(id))) {
      console.log('Geçersiz ID:', id);
      return res.status(400).json({
        success: false,
        message: 'Geçersiz rol ID'
      });
    }

    // Rolün var olup olmadığını kontrol et
    console.log('Rol varlığı kontrol ediliyor, id:', id);
    const existingRole: DatabaseQueryResult<{ id: number; name: string }> = await pool.query(
      'SELECT id, name FROM roles WHERE id = $1',
      [id]
    );
    console.log('Existing role result:', existingRole.rows);

    if (existingRole.rows.length === 0) {
      console.log('Rol bulunamadı');
      return res.status(404).json({
        success: false,
        message: 'Rol bulunamadı'
      });
    }

    // Rolü sil
    console.log('Rol siliniyor...');
    const result: DatabaseQueryResult<Role> = await pool.query(
      'DELETE FROM roles WHERE id = $1 RETURNING *',
      [id]
    );
    console.log('Delete result:', result.rows);

    const deletedRole: Role = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Rol başarıyla silindi',
      data: deletedRole
    });

  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Rol silinirken hata oluştu'
    });
  }
};

// Rol izinlerini güncelle
const updateRolePermissions = async (req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<Response> => {
  try {
    const { id } = req.params;
    const { permission_ids }: UpdateRolePermissionsInput = req.body;

    // Önce mevcut izinleri sil
    await pool.query('DELETE FROM role_permissions_map WHERE role_id = $1', [id]);

    // Yeni izinleri ekle
    if (permission_ids && permission_ids.length > 0) {
      const insertPromises = permission_ids.map((permissionId: number) => 
        pool.query(
          'INSERT INTO role_permissions_map (role_id, permission_id) VALUES ($1, $2)',
          [id, permissionId]
        )
      );
      await Promise.all(insertPromises);
    }

    return res.status(200).json({
      success: true,
      message: 'Rol izinleri başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Update role permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Rol izinleri güncellenirken hata oluştu'
    });
  }
};

// Rol izinlerini getir
const getRolePermissions = async (req: AuthenticatedRequest, res: Response<ApiResponse<Permission[]>>): Promise<Response> => {
  try {
    const { id } = req.params;

    const result: DatabaseQueryResult<Permission> = await pool.query(`
      SELECT p.id, p.key, p.description, p.module
      FROM permissions p
      INNER JOIN role_permissions_map rpm ON p.id = rpm.permission_id
      WHERE rpm.role_id = $1
      ORDER BY p.module, p.key
    `, [id]);

    return res.status(200).json({
      success: true,
      message: 'Rol izinleri başarıyla getirildi',
      data: result.rows
    });

  } catch (error) {
    console.error('Get role permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Rol izinleri getirilirken hata oluştu'
    });
  }
};

export {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getRolePermissions
};

export default {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getRolePermissions
};