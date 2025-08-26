import { Response, NextFunction } from 'express';
import { userService } from '../../services/user';
import { AuthenticatedRequest, ApiResponse, User, UpdateUserInput } from '../../types/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const getAllUsers = async (req: AuthenticatedRequest, res: Response<ApiResponse<User[]>>, next: NextFunction): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınırken hata oluştu'
    });
  }
};

const getUserById = async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(parseInt(id));
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by id hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı alınırken hata oluştu'
    });
  }
};

const updateUser = async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateUserInput = req.body;
    
    const result = await userService.updateUser(parseInt(id), updateData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update user hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu'
    });
  }
};

const deleteUser = async (req: AuthenticatedRequest, res: Response<ApiResponse<any>>, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(parseInt(id));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Delete user hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu'
    });
  }
};

const searchUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q: query, page = '1', limit = '10' } = req.query;
    
    const result = await userService.searchUsers(
      query as string || '',
      parseInt(page as string),
      parseInt(limit as string)
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Search users hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı arama sırasında hata oluştu'
    });
  }
};

interface LoginRequest {
  identifier: string;
  password: string;
}

const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier, password }: LoginRequest = req.body;
    
    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Email/kullanıcı adı ve şifre gereklidir'
      });
      return;
    }
    
    // Email ile kullanıcıyı bul
    let user = await userService.getUserByEmail(identifier);
    
    // Email ile bulunamadıysa, kullanıcı adı ile ara
    if (!user) {
      const users = await userService.getAllUsers();
      user = users.find(u => u.user_name === identifier) || null;
    }
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı bilgileri'
      });
      return;
    }
    
    // Şifre kontrolü (bu kısım user tablosunda password alanı varsa çalışır)
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Geçersiz şifre'
    //   });
    // }
    
    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        user_id: user.id,
        email: user.email,
        role: user.role
      },
      (() => {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT_SECRET environment variable is required for security');
        }
        return jwtSecret;
      })(),
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user.id,
          user_name: user.user_name,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş işlemi sırasında hata oluştu'
    });
  }
};

const getUserRoles = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const roles = await userService.getUserRoles(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get user roles hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı rolleri alınırken hata oluştu'
    });
  }
};

const assignRoleToUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    
    if (!roleId) {
      res.status(400).json({
        success: false,
        message: 'Rol ID gereklidir'
      });
      return;
    }
    
    const result = await userService.assignRoleToUser(parseInt(id), parseInt(roleId));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Assign role to user hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rol atanırken hata oluştu'
    });
  }
};

const removeRoleFromUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, roleId } = req.params;
    
    const result = await userService.removeRoleFromUser(parseInt(id), parseInt(roleId));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Remove role from user hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rol kaldırılırken hata oluştu'
    });
  }
};

const updateUserRoles = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { roleIds } = req.body;
    
    if (!Array.isArray(roleIds)) {
      res.status(400).json({
        success: false,
        message: 'Rol ID listesi gereklidir'
      });
      return;
    }
    
    const result = await userService.updateUserRoles(parseInt(id), roleIds.map(id => parseInt(id)));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update user roles hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı rolleri güncellenirken hata oluştu'
    });
  }
};

const getUserPermissions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await userService.getUserPermissions(parseInt(id));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Get user permissions hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı izinleri alınırken hata oluştu'
    });
  }
};

const assignPermissionToUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissionId } = req.body;
    
    if (!permissionId) {
      res.status(400).json({
        success: false,
        message: 'İzin ID gereklidir'
      });
      return;
    }
    
    const result = await userService.assignPermissionToUser(parseInt(id), parseInt(permissionId));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Assign permission to user hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İzin atanırken hata oluştu'
    });
  }
};

const removePermissionFromUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, permissionId } = req.params;
    
    const result = await userService.removePermissionFromUser(parseInt(id), parseInt(permissionId));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Remove permission from user hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İzin kaldırılırken hata oluştu'
    });
  }
};

const updateUserPermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;
    
    if (!Array.isArray(permissionIds)) {
      res.status(400).json({
        success: false,
        message: 'İzin ID listesi gereklidir'
      });
      return;
    }
    
    const result = await userService.updateUserPermissions(parseInt(id), permissionIds.map(id => parseInt(id)));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update user permissions hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı izinleri güncellenirken hata oluştu'
    });
  }
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  login,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  updateUserRoles,
  getUserPermissions,
  assignPermissionToUser,
  removePermissionFromUser,
  updateUserPermissions,
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  login,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  updateUserRoles,
  getUserPermissions,
  assignPermissionToUser,
  removePermissionFromUser,
  updateUserPermissions,
};