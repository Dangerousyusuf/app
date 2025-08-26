import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FONTS } from '../../constants';
import Svg, { Path } from 'react-native-svg';
import PermissionsService from '../../services/permissionsService';

interface CreatePermissionScreenProps {
  navigation: any;
  toggleSidebar: () => void;
  toggleRightSidebar: () => void;
}

interface Colors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface ModuleOption {
  value: string;
  title: string;
  description: string;
}

interface PermissionData {
  key: string;
  description: string;
  module: string;
}

const CreatePermissionScreen: React.FC<CreatePermissionScreenProps> = ({ navigation, toggleSidebar, toggleRightSidebar }) => {
  const { colors } = useTheme();
  const { token, isAuthenticated } = useAuth();
  const [permissionKey, setPermissionKey] = useState<string>('');
  const [permissionDescription, setPermissionDescription] = useState<string>('');
  const [permissionModule, setPermissionModule] = useState<string>('');
  const [customModule, setCustomModule] = useState<string>('');
  const [isCustomModule, setIsCustomModule] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
    moduleContainer: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
    },
    moduleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastModuleOption: {
      borderBottomWidth: 0,
    },
    moduleRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    moduleRadioSelected: {
      backgroundColor: colors.primary,
    },
    moduleRadioInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    moduleText: {
      ...FONTS.body3,
      color: colors.text,
      flex: 1,
    },
    moduleDescription: {
      ...FONTS.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    moduleLeft: {
      flex: 1,
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
    helpText: {
      ...FONTS.caption,
      color: colors.textSecondary,
      marginTop: 4,
      fontStyle: 'italic',
    },
    customModuleContainer: {
      marginTop: 20,
      paddingTop: 20,
    },
    customModuleLabel: {
      ...FONTS.body2,
      color: colors.text,
      marginBottom: 8,
      fontWeight: '500',
    },
    customModuleInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      ...FONTS.body2,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    customModuleInputActive: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
  });

  const moduleOptions: ModuleOption[] = [
    {
      value: 'users',
      title: 'Kullanıcılar',
      description: 'Kullanıcı yönetimi ile ilgili izinler'
    },
    {
      value: 'roles',
      title: 'Roller',
      description: 'Rol yönetimi ile ilgili izinler'
    },
    {
      value: 'permissions',
      title: 'İzinler',
      description: 'İzin yönetimi ile ilgili izinler'
    },
    {
      value: 'clubs',
      title: 'Kulüpler',
      description: 'Kulüp yönetimi ile ilgili izinler'
    },
    {
      value: 'reports',
      title: 'Raporlar',
      description: 'Rapor görüntüleme ile ilgili izinler'
    },
    {
      value: 'settings',
      title: 'Ayarlar',
      description: 'Sistem ayarları ile ilgili izinler'
    },
  ];

  const selectModule = (moduleValue: string): void => {
    setPermissionModule(moduleValue);
    setIsCustomModule(false);
    setCustomModule('');
  };

  const handleCustomModuleChange = (text: string): void => {
    setCustomModule(text);
    if (text.trim()) {
      setIsCustomModule(true);
      setPermissionModule('');
    } else {
      setIsCustomModule(false);
    }
  };

  const handleCreatePermission = async (): Promise<void> => {
    // İzin anahtarı kontrolü
    if (!permissionKey.trim()) {
      Alert.alert('Hata', 'İzin anahtarı gereklidir.');
      return;
    }
    
    if (permissionKey.trim().length < 3 || permissionKey.trim().length > 100) {
      Alert.alert('Hata', 'İzin anahtarı 3-100 karakter arasında olmalıdır.');
      return;
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(permissionKey.trim())) {
      Alert.alert('Hata', 'İzin anahtarı sadece harf, rakam, nokta, alt çizgi ve tire içerebilir.');
      return;
    }

    // İzin açıklaması kontrolü
    if (!permissionDescription.trim()) {
      Alert.alert('Hata', 'İzin açıklaması gereklidir.');
      return;
    }
    
    if (permissionDescription.trim().length < 5 || permissionDescription.trim().length > 500) {
      Alert.alert('Hata', 'İzin açıklaması 5-500 karakter arasında olmalıdır.');
      return;
    }

    // Modül kontrolü
    if (!permissionModule && !customModule.trim()) {
      Alert.alert('Hata', 'Modül seçimi veya manuel modül girişi gereklidir.');
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
      const permissionData: PermissionData = {
        key: permissionKey.trim(),
        description: permissionDescription.trim(),
        module: isCustomModule ? customModule.trim() : permissionModule
      };

      console.log('İzin oluşturuluyor:', permissionData);

      // Gerçek API çağrısı
      const response = await PermissionsService.createPermission(permissionData, token);
      
      if (response.success) {
        Alert.alert(
          'Başarılı',
          response.message || 'İzin başarıyla oluşturuldu.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(response.message || 'İzin oluşturulamadı.');
      }
    } catch (error: any) {
      console.error('İzin oluşturma hatası:', error);
      
      let errorMessage = 'İzin oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          // Validation hatalarını göster
          errorMessage = error.response.data.errors.map((err: any) => err.msg).join('\n');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = permissionKey.trim().length > 0 && 
                     permissionDescription.trim().length > 0 && 
                     (permissionModule.length > 0 || customModule.trim().length > 0) && 
                     !loading;

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
          
          <Text style={styles.headerTitle}>İzin Oluştur</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Temel Bilgiler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>İzin Anahtarı *</Text>
            <TextInput
              style={styles.input}
              value={permissionKey}
              onChangeText={setPermissionKey}
              placeholder="Örn: users.create, roles.edit, reports.view"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.helpText}>
              İzin anahtarı genellikle "modül.eylem" formatında olur (örn: users.create)
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={permissionDescription}
              onChangeText={setPermissionDescription}
              placeholder="Bu iznin ne işe yaradığını açıklayın..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Modül Seçimi */}
        <View style={styles.section}>
          {/* Manuel Modül Girişi */}
          <View style={styles.customModuleContainer}>
            <Text style={styles.customModuleLabel}>Manuel modül adı girin:</Text>
            <TextInput
              style={[
                styles.customModuleInput,
                isCustomModule && styles.customModuleInputActive
              ]}
              placeholder="Örn: custom_module"
              placeholderTextColor={colors.textSecondary}
              value={customModule}
              onChangeText={handleCustomModuleChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Modül Seçimi</Text>
          
          {/* Hazır Modüllerden Seçin */}
          <View style={styles.moduleContainer}>
            {moduleOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moduleOption,
                  index === moduleOptions.length - 1 && styles.lastModuleOption
                ]}
                onPress={() => selectModule(option.value)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.moduleRadio,
                  permissionModule === option.value && styles.moduleRadioSelected
                ]}>
                  {permissionModule === option.value && (
                    <View style={styles.moduleRadioInner} />
                  )}
                </View>
                <View style={styles.moduleLeft}>
                  <Text style={styles.moduleText}>{option.title}</Text>
                  <Text style={styles.moduleDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          !isFormValid && styles.disabledButton
        ]}
        onPress={handleCreatePermission}
        disabled={!isFormValid}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>{loading ? 'İzin Oluşturuluyor...' : 'İzin Oluştur'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CreatePermissionScreen;