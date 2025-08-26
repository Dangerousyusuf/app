import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import permissionsService from '../../services/permissionsService';
import { FONTS } from '../../constants';
import Svg, { Path } from 'react-native-svg';

interface Props {
  navigation: any;
  toggleSidebar?: () => void;
  toggleRightSidebar?: () => void;
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

interface Permission {
  id: string;
  key: string;
  description: string;
  module: string;
}

interface RoleData {
  name: string;
  description?: string | null;
  permission_ids: string[];
}

const CreateRoleScreen: React.FC<Props> = ({ navigation, toggleSidebar, toggleRightSidebar }) => {
  const { colors }: { colors: Colors } = useTheme();
  const { token, isAuthenticated } = useAuth();
  const [roleName, setRoleName] = useState<string>('');
  const [roleDescription, setRoleDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Permissions modal state
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      paddingHorizontal: 20,
    },
    topHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    bottomHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    sidebarButton: {
      padding: 8,
    },
    rightSidebarButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginVertical: 20,
    },
    sectionTitle: {
      ...FONTS.h3,
      color: colors.text,
      fontWeight: '600',
      marginBottom: 15,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      ...FONTS.body3,
      color: colors.text,
      marginBottom: 8,
      fontWeight: '500',
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      ...FONTS.body3,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    permissionsSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    permissionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    permissionsTitle: {
      ...FONTS.h4,
      color: colors.text,
      fontWeight: '600',
      marginBottom: 12,
    },
    addPermissionButton: {
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addPermissionButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    selectedPermissionsList: {
      marginTop: 8,
    },
    selectedPermissionItem: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    permissionInfo: {
      flex: 1,
    },
    permissionKey: {
      fontSize: 14,
      fontWeight: '600',
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
      color: colors.primary,
      fontWeight: '500',
    },
    removePermissionButton: {
      backgroundColor: colors.error || '#FF4444',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    removePermissionButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    permissionsPlaceholder: {
      ...FONTS.body3,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 20,
    },
    createButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginVertical: 20,
      marginHorizontal: 20,
    },
    createButtonText: {
      ...FONTS.h3,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 50,
    },
    modalTitle: {
      ...FONTS.h3,
      color: colors.text,
      fontWeight: '600',
    },
    modalCloseButton: {
      backgroundColor: colors.surface,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseButtonText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    modalLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalLoadingText: {
      ...FONTS.body2,
      color: colors.textSecondary,
      marginTop: 12,
    },
    permissionsList: {
      flex: 1,
      padding: 20,
    },
    permissionItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    permissionItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    permissionItemContent: {
      flex: 1,
    },
    permissionItemKey: {
      fontSize: 14,
      fontWeight: '600',
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
      color: colors.primary,
      fontWeight: '500',
    },
    permissionSelectedIndicator: {
      backgroundColor: colors.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    permissionSelectedText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  // Load permissions on component mount
  useEffect(() => {
    loadPermissions();
  }, []);

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

  const openPermissionsModal = (): void => {
    loadPermissions();
    setShowPermissionsModal(true);
  };

  const removeSelectedPermission = (permissionId: string): void => {
    setSelectedPermissions(selectedPermissions.filter(p => p.id !== permissionId));
  };

  const handleCreateRole = async (): Promise<void> => {
    if (!roleName.trim()) {
      Alert.alert('Hata', 'Rol adı gereklidir.');
      return;
    }

    // Oturum kontrolü
    if (!isAuthenticated || !token) {
      Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      return;
    }

    setLoading(true);

    try {
      // API çağrısı için veri hazırla
      const roleData: RoleData = {
        name: roleName.trim(),
        description: roleDescription.trim() || null,
        permission_ids: selectedPermissions.map(permission => permission.id)
      };

      console.log('Rol oluşturuluyor:', roleData);

      // AuthService ile API çağrısı yap
      const result = await authService.createRole(roleData);

      if (result.success) {
        Alert.alert(
          'Başarılı',
          'Rol başarıyla oluşturuldu.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Hata', result.message || 'Rol oluşturulurken bir hata oluştu.');
      }
    } catch (error: any) {
      // Network hatası kontrolü
      const isNetworkError = error.message.includes('Network Error') || 
                            error.message.includes('Network request failed') ||
                            !error.response;
      
      let errorMessage: string;
      if (isNetworkError) {
        errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.';
      } else {
        // Backend'ten gelen hata mesajını kullan
        errorMessage = error.message || error.response?.data?.message || 'Rol oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid: boolean = roleName.trim().length > 0 && !loading;

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
      <View style={styles.headerContainer}>
        {/* Top Row - Sidebar Buttons */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity
            style={styles.sidebarButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M3 12H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M3 6H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M3 18H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rightSidebarButton}
            onPress={toggleRightSidebar}
            activeOpacity={0.7}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M12 3V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M6 9L12 3L18 9" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M6 15L12 21L18 15" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Row - Back Button and Title */}
        <View style={styles.bottomHeaderRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
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
          
          <Text style={styles.headerTitle}>Rol Oluştur</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Temel Bilgiler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Rol Adı *</Text>
            <TextInput
              style={styles.input}
              value={roleName}
              onChangeText={setRoleName}
              placeholder="Örn: Yönetici, Moderatör, Üye"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={roleDescription}
              onChangeText={setRoleDescription}
              placeholder="Bu rolün sorumluluklarını ve yetkilerini açıklayın..."
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
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          !isFormValid && styles.disabledButton
        ]}
        onPress={handleCreateRole}
        disabled={!isFormValid}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>{loading ? 'Rol Oluşturuluyor...' : 'Rol Oluştur'}</Text>
      </TouchableOpacity>
      
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

export default CreateRoleScreen;