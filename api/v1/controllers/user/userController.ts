import { Request, Response } from 'express';
import { getHttpClient } from '../../../utils/httpClient';
import ResponseFormatter from '../../../utils/responseFormatter';
import { logger } from '../../../utils/logger';
import { RequestWithUser } from '../../types';

// Type definitions for user requests
interface GetUsersQuery {
  page?: string;
  limit?: string;
  search?: string;
}

interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface AssignRoleRequest {
  role_id: string;
}

interface UpdateUserRolesRequest {
  role_ids: string[];
}

interface AssignPermissionRequest {
  permission_id: string;
}

interface UpdateUserPermissionsRequest {
  permission_ids: string[];
}

const userController = {
  // Get all users (admin only)
  getAllUsers: async (req: RequestWithUser & { query: GetUsersQuery }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { page = 1, limit = 10, search = '' } = req.query;

      logger.info('Get all users request', {
        admin_user_id: req.user?.user_id,
        page,
        limit,
        search,
        ip: req.ip
      });

      // Forward request to backend service with query parameters
      const httpClient = getHttpClient();
      const response = await httpClient.getWithAuth(`/users?page=${page}&limit=${limit}&search=${search}`, token || '');

      logger.info('Users retrieved successfully', {
        admin_user_id: req.user?.user_id,
        count: response.data?.data?.length || 0
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Get all users failed', {
        error: (error as Error).message,
        admin_user_id: req.user?.user_id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Get user by ID
  getUserById: async (req: RequestWithUser & { params: { id: string } }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const requesterId = req.user?.user_id;

      logger.info('Get user by ID request', {
        requester_user_id: requesterId,
        target_user_id: id,
        ip: req.ip
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.getWithAuth(`/users/${id}`, token || '');

      logger.info('User retrieved successfully', {
        requester_user_id: requesterId,
        target_user_id: id
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Get user by ID failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Update user (admin only)
  updateUser: async (req: RequestWithUser & { params: { id: string }; body: UpdateUserRequest }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const updateData = req.body;
      const adminId = req.user?.user_id;

      logger.info('Update user request', {
        admin_user_id: adminId,
        target_user_id: id,
        fields: Object.keys(updateData),
        ip: req.ip
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.putWithAuth(`/users/${id}`, updateData, token || '');

      logger.info('User updated successfully', {
        admin_user_id: adminId,
        target_user_id: id,
        fields: Object.keys(updateData)
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Update user failed', {
        error: (error as Error).message,
        admin_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Delete user (admin only)
  deleteUser: async (req: RequestWithUser & { params: { id: string } }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const adminId = req.user?.user_id;

      logger.info('Delete user request', {
        admin_user_id: adminId,
        target_user_id: id,
        ip: req.ip
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      logger.info('User deleted successfully', {
        admin_user_id: adminId,
        target_user_id: id
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Delete user failed', {
        error: (error as Error).message,
        admin_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Search users
  searchUsers: async (req: RequestWithUser & { query: { q: string; page?: string; limit?: string } }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { q, page = 1, limit = 10 } = req.query;

      // Boş sorgu durumunda tüm kullanıcıları getir
      const searchQuery = q ? q.trim() : '';

      logger.info('Search users request', {
        user_id: req.user?.user_id,
        query: searchQuery,
        page,
        limit,
        ip: req.ip
      });

      // Forward request to backend service
      const httpClient = getHttpClient();
      const response = await httpClient.getWithAuth(`/users/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${limit}`, token || '');

      logger.info('User search completed', {
        user_id: req.user?.user_id,
        query: searchQuery,
        results: response.data?.data?.length || 0
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Search users failed', {
        error: (error as Error).message,
        user_id: req.user?.user_id,
        query: req.query.q || '',
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Get user roles
  getUserRoles: async (req: RequestWithUser & { params: { id: string } }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const requesterId = req.user?.user_id;

      logger.info('Get user roles request', {
        requester_user_id: requesterId,
        target_user_id: id,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.getWithAuth(`/users/${id}/roles`, token || '');

      logger.info('User roles retrieved successfully', {
        requester_user_id: requesterId,
        target_user_id: id,
        roles_count: response.data?.data?.length || 0
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Get user roles failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Assign role to user
  assignRoleToUser: async (req: RequestWithUser & { params: { id: string }; body: AssignRoleRequest }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const { roleId } = req.body;
      const requesterId = req.user?.user_id;

      logger.info('Assign role to user request', {
        requester_user_id: requesterId,
        target_user_id: id,
        role_id: roleId,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.postWithAuth(`/users/${id}/roles`, { roleId }, token || '');

      logger.info('Role assigned to user successfully', {
        requester_user_id: requesterId,
        target_user_id: id,
        role_id: roleId
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Assign role to user failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        role_id: req.body.roleId,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Update user roles
  updateUserRoles: async (req: RequestWithUser & { params: { id: string }; body: UpdateUserRolesRequest }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const { roleIds } = req.body;
      const requesterId = req.user?.user_id;

      logger.info('Update user roles request', {
        requester_user_id: requesterId,
        target_user_id: id,
        role_ids: roleIds,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.putWithAuth(`/users/${id}/roles`, { roleIds }, token || '');

      logger.info('User roles updated successfully', {
        requester_user_id: requesterId,
        target_user_id: id,
        role_ids: roleIds
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Update user roles failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        role_ids: req.body.roleIds,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Remove role from user
  removeRoleFromUser: async (req: RequestWithUser & { params: { id: string; roleId: string } }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id, roleId } = req.params;
      const requesterId = req.user?.user_id;

      logger.info('Remove role from user request', {
        requester_user_id: requesterId,
        target_user_id: id,
        role_id: roleId,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.deleteWithAuth(`/users/${id}/roles/${roleId}`, token || '');

      logger.info('Role removed from user successfully', {
        requester_user_id: requesterId,
        target_user_id: id,
        role_id: roleId
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Remove role from user failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        role_id: req.params.roleId,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Get user permissions
  getUserPermissions: async (req: RequestWithUser & { params: { id: string } }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const requesterId = req.user?.user_id;

      logger.info('Get user permissions request', {
        requester_user_id: requesterId,
        target_user_id: id,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.getWithAuth(`/users/${id}/permissions`, token || '');

      logger.info('User permissions retrieved successfully', {
        requester_user_id: requesterId,
        target_user_id: id,
        permissions_count: response.data?.data?.length || 0
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Get user permissions failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Assign permission to user
  assignPermissionToUser: async (req: RequestWithUser & { params: { id: string }; body: AssignPermissionRequest }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const requesterId = req.user?.user_id;

      logger.info('Assign permission to user request', {
        requester_user_id: requesterId,
        target_user_id: id,
        permission_data: req.body,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.postWithAuth(`/users/${id}/permissions`, req.body, token || '');

      logger.info('Permission assigned to user successfully', {
        requester_user_id: requesterId,
        target_user_id: id
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Assign permission to user failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Update user permissions
  updateUserPermissions: async (req: RequestWithUser & { params: { id: string }; body: UpdateUserPermissionsRequest }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id } = req.params;
      const requesterId = req.user?.user_id;

      logger.info('Update user permissions request', {
        requester_user_id: requesterId,
        target_user_id: id,
        permissions_data: req.body,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.putWithAuth(`/users/${id}/permissions`, req.body, token || '');

      logger.info('User permissions updated successfully', {
        requester_user_id: requesterId,
        target_user_id: id
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Update user permissions failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  },

  // Remove permission from user
  removePermissionFromUser: async (req: RequestWithUser & { params: { id: string; permissionId: string } }, res: Response): Promise<Response> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { id, permissionId } = req.params;
      const requesterId = req.user?.user_id;

      logger.info('Remove permission from user request', {
        requester_user_id: requesterId,
        target_user_id: id,
        permission_id: permissionId,
        ip: req.ip
      });

      const httpClient = getHttpClient();
      const response = await httpClient.deleteWithAuth(`/users/${id}/permissions/${permissionId}`, token || '');

      logger.info('Permission removed from user successfully', {
        requester_user_id: requesterId,
        target_user_id: id,
        permission_id: permissionId
      });

      return ResponseFormatter.handleBackendResponse(res, response);
    } catch (error) {
      logger.error('Remove permission from user failed', {
        error: (error as Error).message,
        requester_user_id: req.user?.user_id,
        target_user_id: req.params.id,
        permission_id: req.params.permissionId,
        ip: req.ip
      });

      return ResponseFormatter.handleBackendError(res, error as any);
    }
  }
};

export default userController;