import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FONTS } from '../../constants';
import { updateRole, deleteRole, updateRolePermissions, getRolePermissions } from '../../services/rolesService';
import permissionsService from '../../services/permissionsService';

interface Props {
  navigation: any;
  route: {
    params: {
      role: Role;
    };
  };
}

interface Colors {
  background: string;
  text: string;
  primary: string;
  surface: string;
  border: string;
  textSecondary: string;
  error?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Permission {
  id: string;
  key: string;
  description: string;
  module: string;
}

interface UpdateRoleData {
  name: string;
  description?: string;
}

const RoleSettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors }: { colors: Colors } = useTheme();
  const { user, token } = useAuth();
  const { role } = route.params;
  
  const [roleName, setRoleName] = useState<string>(role.name);
  const [roleDescription, setRoleDescription] = useState<string>(role.description || '');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Permissions modal state
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false);

  // Load role permissions on component mount
  useEffect(() => {
    loadRolePermissions();
  }, [role.id]);

  const loadRolePermissions = async (): Promise<void> => {
    try {
      const response = await getRolePermissions(role.id);
      if (response.success) {
        setSelectedPermissions(response.data);
      }
    } catch (error: any) {
      console.error('Rol izinleri yükleme hatası:', error);
    }
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
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonText: {
      color: '#FFFFFF',
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
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      ...FONTS.body3,
      color: colors.text,
      fontWeight: '500' as const,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top' as const,
    },
    permissionsSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    permissionsTitle: {
      ...FONTS.h4,
      color: colors.text,
      fontWeight: '600' as const,
      marginBottom: 12,
    },
    permissionsPlaceholder: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      paddingVertical: 20,
    },
    deleteButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.error || '#FF4444',
      alignItems: 'center' as const,
      marginTop: 20,
    },
    deleteButtonText: {
      color: colors.error || '#FF4444',
      fontWeight: '600' as const,
      fontSize: 16,
    },
    // Permissions styles
    permissionsHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 12,
    },
    addPermissionButton: {
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    addPermissionButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600' as const,
    },
    selectedPermissionsList: {
      marginTop: 8,
    },
    selectedPermissionItem: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    permissionInfo: {
      flex: 1,
    },
    permissionKey: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    permissionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    permissionModule: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
    },
    removePermissionButton: {
      backgroundColor: colors.error || '#FF4444',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginLeft: 8,
    },
    removePermissionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600' as const,
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    modalCloseButtonText: {
      fontSize: 18,
      color: colors.text,
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
      color: colors.textSecondary,
    },
    permissionsList: {
      flex: 1,
      padding: 20,
    },
    permissionItem: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    permissionItemSelected: {
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    permissionItemContent: {
      flex: 1,
    },
    permissionItemKey: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    permissionItemDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    permissionItemModule: {
      fontSize: 11,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
    },
    permissionSelectedIndicator: {
      backgroundColor: colors.primary,
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
  };

  const handleSave = async (): Promise<void> => {
    if (!roleName.trim()) {
      Alert.alert('Hata', 'Rol adı boş olamaz');
      return;
    }

    setLoading(true);
    try {
      // Update role basic info
      const updateData: UpdateRoleData = {
        name: roleName,
        description: roleDescription,
      };
      const updatedRole = await updateRole(role.id, updateData);
      
      // Update role permissions
      const permissionIds = selectedPermissions.map(permission => permission.id);
      await updateRolePermissions(role.id, permissionIds);
      
      Alert.alert('Başarılı', 'Rol ve izinler başarıyla güncellendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Rol güncelleme hatası:', error);
      Alert.alert('Hata', 'Rol güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    Alert.alert(
      'Rol Sil',
      `"${role.name}" rolünü silmek istediğinizden emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await deleteRole(role.id);
              
              if (response.success) {
                Alert.alert('Başarılı', 'Rol başarıyla silindi', [
                  { text: 'Tamam', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Hata', response.message || 'Rol silinirken bir hata oluştu');
              }
            } catch (error: any) {
              console.error('Rol silme hatası:', error);
              Alert.alert('Hata', error.message || 'Rol silinirken bir hata oluştu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Permission management functions
  const loadPermissions = async (): Promise<void> => {
    try {
      setPermissionsLoading(true);
      const response = await permissionsService.getAllPermissions(token);
      if (response.success) {
        setPermissions(response.data);
      } else {
        Alert.alert('Hata', 'İzinler yüklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('İzin yükleme hatası:', error);
      Alert.alert('Hata', 'İzinler yüklenirken bir hata oluştu');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handlePermissionSelect = (permission: Permission): void => {
    const isSelected = selectedPermissions.some(p => p.id === permission.id);
    if (isSelected) {
      setSelectedPermissions(selectedPermissions.filter(p => p.id !== permission.id));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const removeSelectedPermission = (permissionId: string): void => {
    setSelectedPermissions(selectedPermissions.filter(p => p.id !== permissionId));
  };

  const openPermissionsModal = (): void => {
    setShowPermissionsModal(true);
    loadPermissions();
  };

  const renderPermissionItem: ListRenderItem<Permission> = ({ item }) => {
    const isSelected = selectedPermissions.some(p => p.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.permissionItem,
          isSelected && styles.permissionItemSelected
        ]}
        onPress={() => handlePermissionSelect(item)}
      >
        <View style={styles.permissionItemContent}>
          <Text style={styles.permissionItemKey}>{item.key}</Text>
          <Text style={styles.permissionItemDescription}>{item.description}</Text>
          <Text style={styles.permissionItemModule}>Modül: {item.module}</Text>
        </View>
        {isSelected && (
          <View style={styles.permissionSelectedIndicator}>
            <Text style={styles.permissionSelectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
        
        <Text style={styles.headerTitle}>Rol Ayarları</Text>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rol Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rol Bilgileri</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rol Adı</Text>
            <TextInput
              style={styles.input}
              value={roleName}
              onChangeText={setRoleName}
              placeholder="Rol adını girin"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={roleDescription}
              onChangeText={setRoleDescription}
              placeholder="Rol açıklamasını girin"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Yetkiler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yetkiler</Text>
          
          <View style={styles.permissionsSection}>
            <View style={styles.permissionsHeader}>
              <Text style={styles.permissionsTitle}>Rol Yetkileri</Text>
              <TouchableOpacity 
                style={styles.addPermissionButton}
                onPress={openPermissionsModal}
              >
                <Text style={styles.addPermissionButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            {selectedPermissions.length > 0 ? (
              <View style={styles.selectedPermissionsList}>
                {selectedPermissions.map((permission) => (
                  <View key={permission.id} style={styles.selectedPermissionItem}>
                    <View style={styles.permissionInfo}>
                      <Text style={styles.permissionKey}>{permission.key}</Text>
                      <Text style={styles.permissionDescription}>{permission.description}</Text>
                      <Text style={styles.permissionModule}>Modül: {permission.module}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removePermissionButton}
                      onPress={() => removeSelectedPermission(permission.id)}
                    >
                      <Text style={styles.removePermissionButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.permissionsPlaceholder}>
                Henüz yetki eklenmedi. + butonuna tıklayarak yetki ekleyebilirsiniz.
              </Text>
            )}
          </View>
        </View>

        {/* Tehlikeli İşlemler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tehlikeli İşlemler</Text>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
          >
            <Text style={styles.deleteButtonText}>
              {loading ? 'Siliniyor...' : 'Rolü Sil'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Permissions Modal */}
      <Modal
        visible={showPermissionsModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>İzin Seç</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowPermissionsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          {permissionsLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.modalLoadingText}>İzinler yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={permissions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPermissionItem}
              style={styles.permissionsList}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default RoleSettingsScreen;