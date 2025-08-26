// Services index file
export { default as authService } from './authService';
export { default as userService } from './userService';
export { default as clubService } from './clubService';
export { default as clubsService } from './clubsService';
export { default as clubsOwnersService } from './clubsOwnersService';
export { default as gymsService } from './gymsService';
export { default as roleService } from './roleService';
export { default as rolesService } from './rolesService';
export { default as permissionsService } from './permissionsService';
export { default as settingsService } from './settingsService';

// Export service types
export type { 
  AuthServiceInterface,
  LoginCredentials,
  RegisterData,
  RoleData
} from '../types';

// Export additional types from services
export type {
  User,
  Role,
  Permission,
  PaginatedResponse,
  ApiResponse as UserApiResponse
} from './userService';

export type {
  Club,
  Gym,
  CreateClubData,
  UpdateClubData,
  ApiResponse as ClubApiResponse
} from './clubService';

export type {
  Club as ClubsServiceClub,
  ApiResponse as ClubsApiResponse
} from './clubsService';

export type {
  ClubOwner,
  AddOwnerData,
  UpdateOwnershipData,
  ApiResponse as ClubOwnersApiResponse
} from './clubsOwnersService';

export type {
  Gym as GymsServiceGym,
  CreateGymData,
  UpdateGymData,
  ApiResponse as GymsApiResponse
} from './gymsService';

export type {
  Role as RoleServiceRole,
  Permission as RoleServicePermission,
  CreateRoleData,
  UpdateRoleData,
  ApiResponse as RoleServiceApiResponse
} from './roleService';

export type {
  Role as RolesServiceRole,
  Permission as RolesServicePermission,
  CreateRoleData as RolesCreateRoleData,
  UpdateRoleData as RolesUpdateRoleData,
  ApiResponse as RolesServiceApiResponse
} from './rolesService';

export type {
  Permission as PermissionsServicePermission,
  CreatePermissionData,
  UpdatePermissionData,
  ApiResponse as PermissionsApiResponse
} from './permissionsService';

export type {
  UserSettings,
  ApiResponse as SettingsApiResponse
} from './settingsService';
