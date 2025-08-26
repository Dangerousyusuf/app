// Ortak TypeScript tipleri ve interface'leri

// Auth ile ilgili tipler
export interface User {
  id?: string | number;
  username?: string;
  email?: string;
  profile_picture?: string | null;
  gender?: 'male' | 'female';
  first_name?: string;
  last_name?: string;
  user_name?: string;
  phone?: string;
  role?: string;
  theme_preference?: 'light' | 'dark';
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<{ success: boolean; }>;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  tc?: string;
  birth_date?: string;
  role?: string;
}

export interface RoleData {
  name: string;
  description?: string;
  permissions?: string[];
}

// Theme ile ilgili tipler
export interface ThemeContextType {
  theme?: ThemeMode;
  isDark: boolean;
  changeTheme: (newTheme: ThemeMode) => Promise<{ success: boolean; message?: string }>;
  toggleTheme: () => void;
  colors: ColorScheme;
}



// Navigation ile ilgili tipler
export interface NavigationProps {
  navigation: any;
  route?: any;
}

// Club ile ilgili tipler
export interface Club {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClubOwner {
  id: number;
  club_id: number;
  user_id: number;
  created_at?: string;
}

// Gym ile ilgili tipler
export interface Gym {
  id: number;
  name: string;
  description?: string;
  club_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Role ve Permission ile ilgili tipler
export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response tipler
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form validation tipler
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Component Props tipler
export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  loading?: boolean;
}

export interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  navigation: any;
}

// Screen Props tipler
export interface ScreenProps {
  navigation: any;
  route?: any;
}

// Service tipler
export interface ServiceResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface AuthServiceInterface {
  login(identifier: string, password: string): Promise<ApiResponse<{ token: string; user: User }>>;
  register(userData: RegisterData): Promise<ApiResponse<User>>;
  logout(): Promise<ApiResponse<void>>;
  saveToken(token: string): Promise<boolean>;
  getToken(): Promise<string | null>;
  removeToken(): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
  setAuthHeader(): Promise<void>;
  getCurrentUser(): Promise<ApiResponse<User>>;
  createRole(roleData: RoleData): Promise<ApiResponse<Role>>;
  getRoles(): Promise<ApiResponse<Role[]>>;
  uploadProfilePicture(imageSource: string | File): Promise<ApiResponse<{ profilePictureUrl: string }>>;
}

// Settings tipler
export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

// QR Code tipler
export interface QRData {
  type: string;
  data: any;
  timestamp: string;
}

// Search tipler
export interface SearchResult {
  id: number;
  type: 'user' | 'club' | 'gym';
  name: string;
  description?: string;
}

export interface SearchFilters {
  type?: 'user' | 'club' | 'gym';
  query: string;
}

// Sizes ve Font tipler
export interface FontStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing?: number;
}

export interface SizesType {
  base: number;
  font: number;
  radius: number;
  padding: number;
  paddingSmall: number;
  paddingMedium: number;
  paddingLarge: number;
  margin: number;
  marginSmall: number;
  marginMedium: number;
  marginLarge: number;
  largeTitle: number;
  title1: number;
  title2: number;
  title3: number;
  headline: number;
  body: number;
  callout: number;
  subhead: number;
  footnote: number;
  caption1: number;
  caption2: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  body1: number;
  body2: number;
  body3: number;
  body4: number;
  body5: number;
  width: number;
  height: number;
}

export interface FontsType {
  largeTitle: FontStyle;
  title1: FontStyle;
  title2: FontStyle;
  title3: FontStyle;
  headline: FontStyle;
  body: FontStyle;
  callout: FontStyle;
  subhead: FontStyle;
  footnote: FontStyle;
  caption1: FontStyle;
  caption2: FontStyle;
  h1: FontStyle;
  h2: FontStyle;
  h3: FontStyle;
  h4: FontStyle;
  body1: FontStyle;
  body2: FontStyle;
  body3: FontStyle;
  body4: FontStyle;
  body5: FontStyle;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Home: undefined;
  Profile: undefined;
  QR: undefined;
  Settings: undefined;
  Search: undefined;
  UsersList: undefined;
  UsersListScreen: undefined;
  RolesList: undefined;
  RolesListScreen: undefined;
  CreateRole: undefined;
  CreateRoleScreen: undefined;
  RoleSettings: { roleId: string };
  RoleSettingsScreen: { roleId: string };
  Theme: undefined;
  ThemeScreen: undefined;
  PermissionsList: undefined;
  PermissionsListScreen: undefined;
  CreatePermission: undefined;
  CreatePermissionScreen: undefined;
  PermissionSettings: { permissionId: string };
  PermissionSettingsScreen: { permissionId: string };
  UserSettings: { userId: string };
  UserSettingsScreen: { userId: string };
  CreateClub: undefined;
  CreateClubScreen: undefined;
  ClubsList: undefined;
  ClubsListScreen: undefined;
  ClubSettings: { clubId: string };
  ClubSettingsScreen: { clubId: string };
  ClubUsers: { clubId: string };
  ClubUsersScreen: { clubId: string };
  CreateGym: undefined;
  CreateGymScreen: undefined;
  CreateGymFromClub: { clubId: string };
  CreateGymFromClubScreen: { clubId: string };
  GymsList: undefined;
  GymsListScreen: undefined;
  GymSettings: { gymId: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  QR: undefined;
  Profile: undefined;
};

// Navigation prop types
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

export type StackNavigationProps = StackNavigationProp<RootStackParamList>;
export type TabNavigationProps = BottomTabNavigationProp<TabParamList>;

export type AppNavigationProp = CompositeNavigationProp<
  TabNavigationProps,
  StackNavigationProps
>;

// Screen prop types with navigation
export interface LoginScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
  route: RouteProp<RootStackParamList, 'Login'>;
}

export interface RegisterScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
  route: RouteProp<RootStackParamList, 'Register'>;
}

export interface HomeScreenProps {
  navigation: AppNavigationProp;
  route: RouteProp<TabParamList, 'Home'>;
}

export interface QRScreenProps {
  navigation: AppNavigationProp;
  route: RouteProp<TabParamList, 'QR'>;
}

export interface ProfileScreenProps {
  navigation: AppNavigationProp;
  route: RouteProp<TabParamList, 'Profile'>;
}

export interface SettingsScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Settings'>;
  route: RouteProp<RootStackParamList, 'Settings'>;
}

// Color scheme types
export interface ColorScheme {
  // Ana renkler
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  
  // Arka plan ve yüzey renkleri
  background: string;
  surface: string;
  surfaceSecondary: string;
  primaryLight: string;
  
  // Metin renkleri
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Kenar ve gölge renkleri
  border: string;
  separator: string;
  shadow: string;
  
  // Temel renkler
  white: string;
  black: string;
  transparent: string;
  
  // iOS sistem renkleri
  systemGray: string;
  systemGray2: string;
  systemGray3: string;
  systemGray4: string;
  systemGray5: string;
  systemGray6: string;
}



// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ThemeMode = 'light' | 'dark' | 'system';
export type UserRole = 'admin' | 'user' | 'moderator';