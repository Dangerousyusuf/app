import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
  FlatList,
  ListRenderItem
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FONTS } from '../../constants';
import { userService } from '../../services';
import roleService from '../../services/roleService';
import permissionService from '../../services/permissionsService';
import { urlService } from '../../config/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  UserSettingsScreen: { user: User };
};

type UserSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'UserSettingsScreen'>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  user_name: string;
  phone?: string;
  gender?: string;
  created_at?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Permission {
  id: string;
  key?: string;
  name?: string;
  permission_name?: string;
  description?: string;
  permission_description?: string;
  module: string;
}

interface Colors {
  background: string;
  text: string;
  textSecondary: string;
  surface: string;
  border: string;
  primary: string;
}

interface UpdateUserData {
  first_name: string;
  last_name: string;
  email: string;
  user_name: string;
  phone: string | null;
  gender: string | null;
  role: string;
}

const UserSettingsScreen: React.FC<UserSettingsScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { user: currentUser, token } = useAuth();
  const { user } = route.params;
  
  const [firstName, setFirstName] = useState<string>(user.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState<string>(user.name ? user.name.split(' ').slice(1).join(' ') : '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [userName, setUserName] = useState<string>(user.user_name || '');
  const [phone, setPhone] = useState<string>(user.phone ?? '');
  const [gender, setGender] = useState<string>(user.gender ?? '');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Rol yönetimi state'leri
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [selectedRolesForUpdate, setSelectedRolesForUpdate] = useState<Role[]>([]);

  // İzin yönetimi state'leri
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [selectedPermissionsForUpdate, setSelectedPermissionsForUpdate] = useState<Permission[]>([]);

  // Merkezi URL servisi kullanılıyor

  // Form validation
  const validateForm = (): boolean => {
    return !!(firstName.trim() && lastName.trim() && email.trim() && userName.trim());
  };

  const handleSave = async (): Promise<void> => {
    console.log('🚀🚀🚀 HANDLE SAVE ÇAĞRILDI - TEST LOG 🚀🚀🚀');
    console.log('🚀 === HANDLE SAVE BAŞLADI ===');
    console.log('📋 Form validation başlıyor...');
    
    if (!validateForm()) {
      console.log('❌ Form validation başarısız');
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    console.log('✅ Form validation başarılı');

    try {
      setSaving(true);
      console.log('🔍 === INITIAL STATE DEBUG ===');
      console.log('userRoles count:', userRoles?.length || 0);
      console.log('selectedRolesForUpdate count:', selectedRolesForUpdate?.length || 0);
      console.log('userPermissions count:', userPermissions?.length || 0);
      console.log('selectedPermissionsForUpdate count:', selectedPermissionsForUpdate?.length || 0);
      console.log('userRoles:', JSON.stringify(userRoles, null, 2));
      console.log('selectedRolesForUpdate:', JSON.stringify(selectedRolesForUpdate, null, 2));
      console.log('userPermissions:', JSON.stringify(userPermissions, null, 2));
      console.log('selectedPermissionsForUpdate:', JSON.stringify(selectedPermissionsForUpdate, null, 2));
      console.log('=== INITIAL STATE DEBUG END ===');
      console.log('Saving başladı');
      
      const updateData: UpdateUserData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        user_name: userName.trim(),
        phone: phone.trim() || null,
        gender: gender || null,
        role: user.role || 'user'
      };

      // Kullanıcı bilgilerini güncelle
      const userResponse = await userService.updateUser(user.id, updateData);
      
      if (!userResponse.success) {
        Alert.alert('Hata', userResponse.message || 'Kullanıcı güncellenirken bir hata oluştu.');
        return;
      }

      // Roller değişmişse rolleri de güncelle
      const currentRoleIds = userRoles.map(role => role.id).sort();
      const newRoleIds = selectedRolesForUpdate.map(role => role.id).sort();
      const rolesChanged = JSON.stringify(currentRoleIds) !== JSON.stringify(newRoleIds);
      
      console.log('=== ROLE UPDATE DEBUG ===');
      console.log('userRoles:', JSON.stringify(userRoles, null, 2));
      console.log('selectedRolesForUpdate:', JSON.stringify(selectedRolesForUpdate, null, 2));
      console.log('currentRoleIds:', currentRoleIds);
      console.log('newRoleIds:', newRoleIds);
      console.log('currentRoleIds JSON:', JSON.stringify(currentRoleIds));
      console.log('newRoleIds JSON:', JSON.stringify(newRoleIds));
      console.log('rolesChanged:', rolesChanged);
      console.log('=== ROLE UPDATE DEBUG END ===');

      if (rolesChanged) {
        console.log('🔄 UPDATING ROLES - userId:', user.id, 'newRoleIds:', newRoleIds);
        try {
          const roleResponse = await userService.updateUserRoles(user.id, newRoleIds);
          console.log('✅ Role update response:', roleResponse);
          
          if (roleResponse && !roleResponse.success) {
            Alert.alert('Hata', roleResponse.message || 'Roller güncellenirken bir hata oluştu.');
            return;
          }
          
          // Başarılı olursa local state'i güncelle
          setUserRoles(selectedRolesForUpdate);
          console.log('✅ Roles updated successfully');
        } catch (error: any) {
          console.error('❌ Rol güncelleme hatası:', error);
          Alert.alert('Hata', error.message || 'Roller güncellenirken bir hata oluştu.');
          return;
        }
      } else {
        console.log('ℹ️ No role changes detected');
      }

      // İzinler değişmişse izinleri de güncelle
      const currentPermissionIds = userPermissions.map(permission => permission.id).sort();
      const newPermissionIds = selectedPermissionsForUpdate.map(permission => permission.id).sort();
      const permissionsChanged = JSON.stringify(currentPermissionIds) !== JSON.stringify(newPermissionIds);
      
      console.log('=== İZİN KONTROLÜ ===');
      console.log('userPermissions:', userPermissions);
      console.log('selectedPermissionsForUpdate:', selectedPermissionsForUpdate);
      console.log('currentPermissionIds:', currentPermissionIds);
      console.log('newPermissionIds:', newPermissionIds);
      console.log('currentPermissionIds JSON:', JSON.stringify(currentPermissionIds));
      console.log('newPermissionIds JSON:', JSON.stringify(newPermissionIds));
      console.log('permissionsChanged:', permissionsChanged);
      console.log('=== PERMISSION DEBUG END ===');

      if (permissionsChanged) {
        console.log('🔄 UPDATING PERMISSIONS - userId:', user.id, 'newPermissionIds:', newPermissionIds);
        try {
          const permissionResponse = await userService.updateUserPermissions(user.id.toString(), newPermissionIds.map(id => id.toString()));
          console.log('✅ Permission update response:', permissionResponse);
          
          if (permissionResponse && !permissionResponse.success) {
            Alert.alert('Hata', permissionResponse.message || 'İzinler güncellenirken bir hata oluştu.');
            return;
          }
          
          // Başarılı olursa local state'i güncelle
          setUserPermissions(selectedPermissionsForUpdate);
          console.log('✅ Permissions updated successfully');
        } catch (error: any) {
          console.error('❌ İzin güncelleme hatası:', error);
          Alert.alert('Hata', error.message || 'İzinler güncellenirken bir hata oluştu.');
          return;
        }
      } else {
        console.log('ℹ️ No permission changes detected');
      }
      
      Alert.alert('Başarılı', 'Kullanıcı bilgileri, roller ve izinler başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error: any) {
      console.error('Kullanıcı güncelleme hatası:', error);
      
      let errorMessage = 'Kullanıcı güncellenirken bir hata oluştu.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (): void => {
    Alert.alert(
      'Kullanıcıyı Sil',
      `${firstName} ${lastName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await userService.deleteUser(user.id);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Kullanıcı silindi.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', response.message || 'Kullanıcı silinirken bir hata oluştu.');
      }
    } catch (error: any) {
      console.error('Kullanıcı silme hatası:', error);
      Alert.alert('Hata', error.message || 'Kullanıcı silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Rol yönetimi fonksiyonları
  const loadUserRoles = async (): Promise<void> => {
    try {
      setRolesLoading(true);
      const response = await userService.getUserRoles(user.id);
      if (response && response.success) {
        setUserRoles(response.data || []);
      } else {
        setUserRoles([]);
      }
    } catch (error) {
      console.error('Kullanıcı rolleri yükleme hatası:', error);
      setUserRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const loadAvailableRoles = async (): Promise<void> => {
    try {
      const response = await roleService.getAllRoles();
      if (response && response.success) {
        setAvailableRoles(response.data?.roles || []);
      } else {
        setAvailableRoles([]);
      }
    } catch (error) {
      console.error('Roller yükleme hatası:', error);
      setAvailableRoles([]);
    }
  };

  const removeRoleFromUser = (roleId: string): void => {
    // Sadece selectedRolesForUpdate state'ini güncelle, userRoles'u değiştirme
    // Bu sayede handleSave'de değişiklik algılanabilir
    setSelectedRolesForUpdate(prev => prev.filter(role => role.id !== roleId));
  };

  const assignRoleToUser = (roleId: string): void => {
    // Sadece selectedRolesForUpdate state'ini güncelle, userRoles'u değiştirme
    // Bu sayede handleSave'de değişiklik algılanabilir
    const role = Array.isArray(availableRoles) ? availableRoles.find(r => r.id === roleId) : null;
    if (role) {
      setSelectedRolesForUpdate(prev => [...prev, role]);
    }
  };

  const updateUserRoles = async (roleIds: string[]): Promise<void> => {
    try {
      setRolesLoading(true);
      const response = await userService.updateUserRoles(user.id, roleIds);
      
      if (response.success) {
        // Başarılı olursa local state'i güncelle
        setUserRoles(selectedRolesForUpdate);
        Alert.alert('Başarılı', 'Roller başarıyla güncellendi.');
        setShowRoleModal(false);
      } else {
        Alert.alert('Hata', response.message || 'Roller güncellenirken bir hata oluştu.');
      }
    } catch (error: any) {
      console.error('Rol güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Roller güncellenirken bir hata oluştu.');
    } finally {
      setRolesLoading(false);
    }
  };

  // Component mount olduğunda rolleri yükle
  useEffect(() => {
    loadUserRoles();
    loadAvailableRoles();
  }, [user.id]);

  // Component mount olduğunda selectedRolesForUpdate'i userRoles ile başlat
  useEffect(() => {
    if (userRoles.length > 0 && selectedRolesForUpdate.length === 0) {
      setSelectedRolesForUpdate([...userRoles]);
    }
  }, [userRoles.length]); // userRoles yerine userRoles.length kullan

  const getRoleColor = (roleType: string): string => {
    switch (roleType) {
      case 'admin':
        return '#FF6B6B';
      case 'moderator':
        return '#4ECDC4';
      case 'user':
        return '#45B7D1';
      default:
        return colors.text;
    }
  };

  const getRoleName = (roleType: string): string => {
    switch (roleType) {
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderatör';
      case 'user':
        return 'Kullanıcı';
      default:
        return roleType;
    }
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserAvatar = (): string | null => {
    return user.avatar || null;
  };

  // İzin yönetimi fonksiyonları
  const loadUserPermissions = async (): Promise<void> => {
    try {
      setPermissionsLoading(true);
      const response = await userService.getUserPermissions(user.id.toString());
      if (response.success) {
        setUserPermissions(response.data);
      }
    } catch (error) {
      console.error('Kullanıcı izinleri yüklenirken hata:', error);
      Alert.alert('Hata', 'Kullanıcı izinleri yüklenirken bir hata oluştu.');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const loadAvailablePermissions = async (): Promise<void> => {
    try {
      setPermissionsLoading(true);
      const response = await permissionService.getAllPermissions(token);
      if (response.success) {
        setAvailablePermissions(response.data);
      }
    } catch (error) {
      console.error('Mevcut izinler yüklenirken hata:', error);
      Alert.alert('Hata', 'Mevcut izinler yüklenirken bir hata oluştu.');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const removePermissionFromUser = (permissionId: number): void => {
    // Sadece selectedPermissionsForUpdate state'ini güncelle, API çağrısı yapma
    setSelectedPermissionsForUpdate(prev => prev.filter(permission => permission.id !== permissionId));
  };

  const assignPermissionToUser = (permissionId: number): void => {
    // Sadece selectedPermissionsForUpdate state'ini güncelle, API çağrısı yapma
    const permission = Array.isArray(availablePermissions) ? availablePermissions.find(p => p.id === permissionId) : null;
    if (permission) {
      setSelectedPermissionsForUpdate(prev => [...prev, permission]);
    }
  };

  // İzinleri yükle
  useEffect(() => {
    if (user.id) {
      loadUserPermissions();
      loadAvailablePermissions();
    }
  }, [user.id]);

  // userPermissions değiştiğinde selectedPermissionsForUpdate'i senkronize et
  useEffect(() => {
    if (userPermissions.length >= 0) {
      setSelectedPermissionsForUpdate([...userPermissions]);
    }
  }, [userPermissions]);

  const getPermissionColor = (permissionModule: string): string => {
    switch (permissionModule) {
      case 'users':
        return '#FF6B6B';
      case 'roles':
        return '#4ECDC4';
      case 'permissions':
        return '#45B7D1';
      case 'system':
        return '#96CEB4';
      default:
        return colors.text;
    }
  };

  const getPermissionName = (permission: Permission): string => {
    return permission.key || permission.name || permission.permission_name || 'Bilinmeyen İzin';
  };

  const getPermissionDescription = (permission: Permission): string => {
    return permission.description || permission.permission_description || '';
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingTop: 55,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.text,
    },
    saveButton: {
      backgroundColor: validateForm() ? colors.primary : colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonText: {
      color: validateForm() ? '#FFFFFF' : colors.textSecondary,
      fontWeight: '600' as const,
      fontSize: 14,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      ...FONTS.h4,
      color: colors.text,
      fontWeight: '600' as const,
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userInfoSection: {
      alignItems: 'center' as const,
      marginBottom: 24,
    },
    avatarContainer: {
      position: 'relative' as const,
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: '600' as const,
      color: '#FFFFFF',
    },
    userNameDisplay: {
      fontSize: 24,
      fontWeight: '600' as const,
      color: colors.text,
      textAlign: 'center' as const,
      marginBottom: 8,
    },
    userEmailDisplay: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      marginBottom: 12,
    },
    roleBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'center' as const,
    },
    roleText: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      ...FONTS.body2,
      color: colors.text,
      fontWeight: '500' as const,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    selectButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    selectButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    deleteButton: {
      backgroundColor: '#FF6B6B',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center' as const,
      marginTop: 20,
    },
    deleteButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600' as const,
    },
    // Rol yönetimi stilleri
    loadingContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: 20,
    },
    loadingText: {
      marginLeft: 12,
      color: colors.textSecondary,
      fontSize: 14,
    },
    rolesContainer: {
      marginBottom: 20,
    },
    rolesTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 12,
    },
    rolesTitleContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 12,
    },
    addRoleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    rolesChipsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
    },
    roleChip: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    roleChipText: {
      fontSize: 14,
      fontWeight: '500' as const,
      marginRight: 6,
    },
    removeRoleButton: {
      width: 16,
      height: 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    roleIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    // Modal stilleri
    modalContainer: {
      flex: 1,
      paddingTop: 10,
    },
    modalHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
    },
    modalActionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    modalActionButtonText: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    modalLoadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    modalLoadingText: {
      marginTop: 12,
      fontSize: 16,
    },
    permissionsList: {
      flex: 1,
      padding: 20,
    },
    permissionItem: {
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
    },
    permissionItemContent: {
      flex: 1,
    },
    permissionItemKey: {
      fontSize: 14,
      fontWeight: '600' as const,
      marginBottom: 4,
    },
    permissionItemDescription: {
      fontSize: 12,
      marginBottom: 2,
    },
    permissionItemModule: {
      fontSize: 11,
      fontWeight: '500' as const,
    },
    permissionSelectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginLeft: 8,
    },
    permissionSelectedText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600' as const,
    },
    noRolesText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
      textAlign: 'center' as const,
      marginTop: 8,
    },
    modalList: {
      flex: 1,
      padding: 20,
    },
    modalItem: {
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
    },
    modalItemContent: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    modalItemInfo: {
      flex: 1,
    },
    modalItemTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      marginBottom: 4,
    },
    modalItemDescription: {
      fontSize: 14,
      marginBottom: 8,
    },
    permissionModuleChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 4,
      alignSelf: 'flex-start' as const,
    },
    permissionModuleText: {
      fontSize: 12,
      fontWeight: '500' as const,
    },
    modalFooter: {
      padding: 20,
    },
    modalSaveButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center' as const,
    },
    modalSaveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600' as const,
    },
    emptyText: {
      textAlign: 'center' as const,
      fontSize: 16,
      marginTop: 50,
    }
  };

  const renderRoleItem: ListRenderItem<Role> = ({ item }) => {
    const isAssigned = selectedRolesForUpdate.some(role => role.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.permissionItem, 
          { 
            backgroundColor: isAssigned ? colors.primary + '10' : colors.surface, 
            borderColor: isAssigned ? colors.primary : colors.border,
            borderWidth: isAssigned ? 2 : 1
          }
        ]}
        onPress={() => {
          if (isAssigned) {
            setSelectedRolesForUpdate(prev => prev.filter(role => role.id !== item.id));
          } else {
            setSelectedRolesForUpdate(prev => [...prev, item]);
          }
        }}
        disabled={rolesLoading}
      >
        <View style={styles.permissionItemContent}>
          <Text style={[styles.permissionItemKey, { color: colors.text }]}>
            {getRoleName(item.name)}
          </Text>
          <Text style={[styles.permissionItemDescription, { color: colors.textSecondary }]}>
            {item.description || 'Rol açıklaması bulunmuyor'}
          </Text>
          <Text style={[styles.permissionItemModule, { color: colors.primary }]}>
            {isAssigned ? 'Atanmış' : 'Atanabilir'} • Rol ID: {item.id}
          </Text>
        </View>
        {isAssigned && (
          <View style={[
            styles.permissionSelectedIndicator, 
            { backgroundColor: colors.primary }
          ]}>
            <Text style={styles.permissionSelectedText}>
              ✓
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPermissionItem: ListRenderItem<Permission> = ({ item }) => {
    const isSelected = selectedPermissionsForUpdate.some(p => p.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.permissionItem, 
          { 
            backgroundColor: isSelected ? colors.primary + '10' : colors.surface, 
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1
          }
        ]}
        onPress={() => {
          if (isSelected) {
            setSelectedPermissionsForUpdate(prev => prev.filter(p => p.id !== item.id));
          } else {
            setSelectedPermissionsForUpdate(prev => [...prev, item]);
          }
        }}
        disabled={permissionsLoading}
      >
        <View style={styles.permissionItemContent}>
          <Text style={[styles.permissionItemKey, { color: colors.text }]}>
            {getPermissionName(item)}
          </Text>
          <Text style={[styles.permissionItemDescription, { color: colors.textSecondary }]}>
            {getPermissionDescription(item) || 'İzin açıklaması bulunmuyor'}
          </Text>
          <Text style={[styles.permissionItemModule, { color: colors.primary }]}>
            {isSelected ? 'Atanmış' : 'Atanabilir'} • {item.module}
          </Text>
        </View>
        {isSelected && (
          <View style={[
            styles.permissionSelectedIndicator, 
            { backgroundColor: colors.primary }
          ]}>
            <Text style={styles.permissionSelectedText}>
              ✓
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12H5M12 19L5 12L12 5"
              stroke={colors.text}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Kullanıcı Ayarları</Text>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving || !validateForm()}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kullanıcı Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kullanıcı Bilgileri</Text>
          <View style={styles.card}>
            <View style={styles.userInfoSection}>
              <View style={styles.avatarContainer}>
                {getUserAvatar() ? (
                  <Image 
                    source={{ uri: getUserAvatar()! }} 
                    style={styles.avatar}
                    onError={() => console.log('Profil resmi yüklenemedi')}
                  />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(user.role || 'user') }]}>
                    <Text style={styles.avatarText}>{getInitials(firstName, lastName)}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.userNameDisplay}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.userEmailDisplay}>{email}</Text>
              
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role || 'user') + '20' }]}>
                <Text style={[styles.roleText, { color: getRoleColor(user.role || 'user') }]}>
                  {getRoleName(user.role || 'user')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Kullanıcı Düzenle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kullanıcı Düzenle</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ad *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Kullanıcının adını girin"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Soyad *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Kullanıcının soyadını girin"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-posta adresini girin"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kullanıcı Adı *</Text>
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Kullanıcı adını girin"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefon numarasını girin"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cinsiyet</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  Alert.alert(
                    'Cinsiyet Seç',
                    '',
                    [
                      { text: 'İptal', style: 'cancel' },
                      { text: 'Erkek', onPress: () => setGender('male') },
                      { text: 'Kadın', onPress: () => setGender('female') },
                      { text: 'Belirtmek İstemiyorum', onPress: () => setGender('other') }
                    ]
                  );
                }}
              >
                <Text style={styles.selectButtonText}>
                  {gender === 'male' ? 'Erkek' : gender === 'female' ? 'Kadın' : gender === 'other' ? 'Belirtmek İstemiyorum' : 'Cinsiyet seçin'}
                </Text>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M6 9L12 15L18 9"
                    stroke={colors.textSecondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>
                {loading ? 'Siliniyor...' : 'Kullanıcıyı Sil'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rol Yönetimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rol Yönetimi</Text>
          <View style={styles.card}>
            {rolesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Roller yükleniyor...</Text>
              </View>
            ) : (
              <>
                {/* Roller */}
                <View style={styles.rolesContainer}>
                  <View style={styles.rolesTitleContainer}>
                    <Text style={styles.rolesTitle}>Roller</Text>
                    <TouchableOpacity
                      onPress={() => {
                        loadAvailableRoles();
                        setSelectedRolesForUpdate([...userRoles]);
                        setShowRoleModal(true);
                      }}
                      style={[styles.addRoleButton, { backgroundColor: colors.primary }]}
                    >
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 5V19M5 12H19"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.rolesChipsContainer}>
                    {Array.isArray(selectedRolesForUpdate) && selectedRolesForUpdate.length > 0 ? (
                      selectedRolesForUpdate.map((role) => (
                        <View key={role.id} style={[styles.roleChip, { backgroundColor: getRoleColor(role.name) + '20' }]}>
                          <Text style={[styles.roleChipText, { color: getRoleColor(role.name) }]}>
                            {getRoleName(role.name)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeRoleFromUser(role.id)}
                            style={styles.removeRoleButton}
                          >
                            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M18 6L6 18M6 6L18 18"
                                stroke={getRoleColor(role.name)}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noRolesText}>Henüz rol atanmamış.</Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* İzin Yönetimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İzin Yönetimi</Text>
          <View style={styles.card}>
            {permissionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>İzinler yükleniyor...</Text>
              </View>
            ) : (
              <>
                {/* İzinler */}
                <View style={styles.rolesContainer}>
                  <View style={styles.rolesTitleContainer}>
                    <Text style={styles.rolesTitle}>İzinler</Text>
                    <TouchableOpacity
                      onPress={() => {
                        loadAvailablePermissions();
                        setSelectedPermissionsForUpdate([...userPermissions]);
                        setShowPermissionModal(true);
                      }}
                      style={[styles.addRoleButton, { backgroundColor: colors.primary }]}
                    >
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 5V19M5 12H19"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.rolesChipsContainer}>
                    {Array.isArray(selectedPermissionsForUpdate) && selectedPermissionsForUpdate.length > 0 ? (
                      selectedPermissionsForUpdate.map((permission) => (
                        <View key={permission.id} style={[styles.roleChip, { backgroundColor: getPermissionColor(permission.module) + '20' }]}>
                          <Text style={[styles.roleChipText, { color: getPermissionColor(permission.module) }]}>
                            {getPermissionName(permission)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removePermissionFromUser(permission.id)}
                            style={styles.removeRoleButton}
                          >
                            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <Path
                                d="M18 6L6 18M6 6L18 18"
                                stroke={getPermissionColor(permission.module)}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noRolesText}>Henüz izin atanmamış.</Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Rol Atama Modal */}
      <Modal
        visible={showRoleModal && availableRoles !== undefined}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { paddingTop: 50 }]}>
            <Text style={[styles.modalTitle, { color: colors.text, flex: 1 }]}>Rol Seç</Text>
            <TouchableOpacity 
              onPress={() => setShowRoleModal(false)}
              style={{ padding: 8 }}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke={colors.text}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
          
          {rolesLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.modalLoadingText, { color: colors.textSecondary }]}>Roller yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={Array.isArray(availableRoles) ? availableRoles : []}
              keyExtractor={(item) => item.id.toString()}
              style={styles.permissionsList}
              renderItem={renderRoleItem}
              ListEmptyComponent={
                <Text style={[styles.noRolesText, { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }]}>
                  Rol bulunmuyor.
                </Text>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* İzin Atama Modal */}
      <Modal
        visible={showPermissionModal && availablePermissions !== undefined}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { paddingTop: 50 }]}>
            <Text style={[styles.modalTitle, { color: colors.text, flex: 1 }]}>İzin Seç</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowPermissionModal(false);
              }}
              style={{ padding: 8 }}
            >
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke={colors.text}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
          
          {permissionsLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.modalLoadingText, { color: colors.text }]}>İzinler yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={Array.isArray(availablePermissions) ? availablePermissions : []}
              keyExtractor={(item) => item.id.toString()}
              style={styles.permissionsList}
              renderItem={renderPermissionItem}
              ListEmptyComponent={
                <Text style={[styles.noRolesText, { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }]}>
                  İzin bulunmuyor.
                </Text>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

export default UserSettingsScreen;
export type { UserSettingsScreenProps, User, Role, Permission };