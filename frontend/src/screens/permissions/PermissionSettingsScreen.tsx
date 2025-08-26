import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FONTS } from '../../constants';
import permissionsService from '../../services/permissionsService';

interface Props {
  navigation: any;
  route: {
    params: {
      permissionId: string;
    };
  };
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
  createdAt?: string;
  updatedAt?: string;
}

const PermissionSettingsScreen: React.FC<Props> = ({ navigation, route, toggleSidebar, toggleRightSidebar }) => {
  const { colors }: { colors: Colors } = useTheme();
  const { user, token } = useAuth();
  const { permissionId } = route.params;
  
  const [permission, setPermission] = useState<Permission | null>(null);
  const [permissionKey, setPermissionKey] = useState<string>('');
  const [permissionDescription, setPermissionDescription] = useState<string>('');
  const [permissionModule, setPermissionModule] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

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
    infoSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    infoRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      ...FONTS.body3,
      color: colors.textSecondary,
      fontWeight: '500' as const,
    },
    infoValue: {
      ...FONTS.body3,
      color: colors.text,
      fontWeight: '600' as const,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
  };

  useEffect(() => {
    loadPermission();
  }, [permissionId]);

  const loadPermission = async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (!user || !token) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigation.goBack();
        return;
      }
      
      const response = await permissionsService.getPermissionById(permissionId, token);
      
      if (response.success) {
        const permissionData = response.data || response.permission || response;
        setPermission(permissionData);
        setPermissionKey(permissionData.key || '');
        setPermissionDescription(permissionData.description || '');
        setPermissionModule(permissionData.module || '');
      } else {
        throw new Error(response.message || 'İzin bilgileri yüklenirken bir hata oluştu');
      }
      
    } catch (error: any) {
      console.error('İzin yükleme hatası:', error);
      Alert.alert('Hata', error.message || 'İzin bilgileri yüklenirken bir hata oluştu.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!permissionKey.trim() || !permissionDescription.trim() || !permissionModule.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        key: permissionKey.trim(),
        description: permissionDescription.trim(),
        module: permissionModule.trim(),
      };

      const response = await permissionsService.updatePermission(permissionId, updateData, token);

      if (response.success) {
        Alert.alert(
          'Başarılı',
          'İzin başarıyla güncellendi.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Hata', response.message || 'İzin güncellenirken bir hata oluştu.');
      }
    } catch (error: any) {
      console.error('İzin güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'İzin güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (): void => {
    Alert.alert(
      'İzin Sil',
      'Bu izni silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
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
      setSaving(true);
      
      const response = await permissionsService.deletePermission(permissionId, token);
      
      if (response.success) {
        Alert.alert(
          'Başarılı',
          'İzin başarıyla silindi.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Hata', response.message || 'İzin silinirken bir hata oluştu.');
      }
    } catch (error: any) {
      console.error('İzin silme hatası:', error);
      Alert.alert('Hata', error.message || 'İzin silinirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid: boolean = permissionKey.trim().length > 0 && 
                     permissionDescription.trim().length > 0 && 
                     permissionModule.trim().length > 0 && 
                     !saving;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>İzin bilgileri yükleniyor...</Text>
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
        
        <Text style={styles.headerTitle}>İzin Ayarları</Text>
        
        <TouchableOpacity
          style={[styles.saveButton, !isFormValid && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={!isFormValid}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Düzenleme Formu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İzin Bilgileri</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>İzin Anahtarı *</Text>
            <TextInput
              style={styles.input}
              value={permissionKey}
              onChangeText={setPermissionKey}
              placeholder="Örn: users.create, roles.edit"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={permissionDescription}
              onChangeText={setPermissionDescription}
              placeholder="İzin açıklamasını girin..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Modül *</Text>
            <TextInput
              style={styles.input}
              value={permissionModule}
              onChangeText={setPermissionModule}
              placeholder="Örn: users, roles, permissions"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>İzni Sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PermissionSettingsScreen;