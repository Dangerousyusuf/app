import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FONTS } from '../../constants';
import permissionsService from '../../services/permissionsService';

interface Props {
  navigation: any;
}

interface Colors {
  background: string;
  text: string;
  primary: string;
  surface: string;
  border: string;
  textSecondary: string;
  primaryLight?: string;
}

interface Permission {
  id: string;
  key: string;
  description?: string;
  module: string;
  createdAt?: string;
  updatedAt?: string;
}

const PermissionsListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors }: { colors: Colors } = useTheme();
  const { token, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.background,
    },
    loadingText: {
      ...FONTS.body3,
      color: colors.text,
      marginTop: 16,
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
    headerRight: {
      alignItems: 'flex-end' as const,
    },
    permissionCount: {
      ...FONTS.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    searchInputContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      ...FONTS.body3,
      color: colors.text,
      fontSize: 16,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 100,
    },
    permissionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    permissionInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
    },
    permissionDetails: {
      flex: 1,
    },
    permissionKey: {
      ...FONTS.h4,
      color: colors.text,
      fontWeight: '600' as const,
      marginBottom: 4,
    },
    permissionDescription: {
      ...FONTS.body3,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 4,
    },
    permissionModule: {
      ...FONTS.caption,
      color: colors.primary,
      fontSize: 11,
      fontWeight: '500' as const,
      backgroundColor: colors.primaryLight || colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: 'flex-start' as const,
    },
    actionButton: {
      width: 40,
      height: 40,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginLeft: 16,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingVertical: 60,
    },
    emptyStateText: {
      ...FONTS.body2,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      marginTop: 16,
      paddingHorizontal: 40,
    },
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [searchQuery, permissions]);

  const loadPermissions = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Oturum kontrolü
      if (!isAuthenticated || !token) {
        Alert.alert('Hata', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      // API'den izinleri getir
      const response = await permissionsService.getAllPermissions(token);
      
      if (response.success) {
        setPermissions(response.data || []);
      } else {
        throw new Error(response.message || 'İzinler yüklenirken bir hata oluştu');
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('İzinler yüklenirken hata:', error);
      setLoading(false);
      
      // Hata mesajını kullanıcıya göster
      const errorMessage = error.message || 'İzinler yüklenirken bir hata oluştu.';
      Alert.alert('Hata', errorMessage);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadPermissions();
    setRefreshing(false);
  };

  const filterPermissions = (): void => {
    if (!searchQuery.trim()) {
      setFilteredPermissions(permissions);
      return;
    }

    const filtered = permissions.filter(permission => 
      permission.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (permission.module && permission.module.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPermissions(filtered);
  };

  const handlePermissionPress = (permission: Permission): void => {
    console.log('İzin seçildi:', permission.key);
    navigation.navigate('PermissionSettingsScreen', { permissionId: permission.id });
  };

  const renderPermissionItem: ListRenderItem<Permission> = ({ item }) => (
    <TouchableOpacity
      style={styles.permissionCard}
      onPress={() => handlePermissionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.permissionInfo}>
        <View style={styles.permissionDetails}>
          <Text style={styles.permissionKey}>{item.key}</Text>
          <Text style={styles.permissionDescription}>
            {item.description || 'Açıklama bulunmuyor'}
          </Text>
          <Text style={styles.permissionModule}>{item.module}</Text>
        </View>

        <View style={styles.actionButton}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 18L15 12L9 6"
              stroke={colors.textSecondary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = (): JSX.Element => (
    <View style={styles.emptyState}>
      <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 12L11 14L15 10"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Arama kriterlerine uygun izin bulunamadı' : 'Henüz izin bulunmuyor'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>İzinler yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>İzin Listesi</Text>
        <View style={styles.headerRight}>
          <Text style={styles.permissionCount}>{filteredPermissions.length} izin</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
            <Circle cx="11" cy="11" r="8" stroke={colors.textSecondary} strokeWidth="2" />
            <Path d="M21 21L16.65 16.65" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="İzin ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke={colors.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Permissions List */}
      <FlatList
        data={filteredPermissions}
        renderItem={renderPermissionItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

export default PermissionsListScreen;