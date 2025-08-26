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
import { FONTS } from '../../constants';
import authService from '../../services/authService';

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
  error?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface RolesResponse {
  success: boolean;
  data?: {
    roles: Role[];
  };
  message?: string;
}

const RolesListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors }: { colors: Colors } = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
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
    roleCount: {
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
    roleCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roleInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
    },
    roleDetails: {
      flex: 1,
    },
    roleName: {
      ...FONTS.h4,
      color: colors.text,
      fontWeight: '600' as const,
      marginBottom: 8,
    },
    roleDescription: {
      ...FONTS.body3,
      color: colors.textSecondary,
      lineHeight: 20,
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
    loadRoles();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [searchQuery, roles]);

  const loadRoles = async (): Promise<void> => {
    try {
      setLoading(true);
      const response: RolesResponse = await authService.getRoles();
      
      if (response.success && response.data && response.data.roles) {
        setRoles(response.data.roles);
      } else {
        setRoles([]);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Roller yüklenirken hata:', error);
      setLoading(false);
      Alert.alert('Hata', error.message || 'Roller yüklenirken bir hata oluştu.');
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadRoles();
    setRefreshing(false);
  };

  const filterRoles = (): void => {
    if (!searchQuery.trim()) {
      setFilteredRoles(roles);
      return;
    }

    const filtered = roles.filter(role => 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredRoles(filtered);
  };

  const handleRolePress = (role: Role): void => {
    console.log('Rol seçildi:', role.name);
    navigation.navigate('RoleSettings', { role: role });
  };

  const renderRoleItem: ListRenderItem<Role> = ({ item }) => (
    <TouchableOpacity
      style={styles.roleCard}
      onPress={() => handleRolePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.roleInfo}>
        <View style={styles.roleDetails}>
          <Text style={styles.roleName}>{item.name}</Text>
          <Text style={styles.roleDescription}>
            {item.description || 'Açıklama bulunmuyor'}
          </Text>
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
          d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Arama kriterlerine uygun rol bulunamadı' : 'Henüz rol bulunmuyor'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Roller yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Rol Listesi</Text>
        <View style={styles.headerRight}>
          <Text style={styles.roleCount}>{filteredRoles.length} rol</Text>
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
            placeholder="Rol ara..."
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

      {/* Roles List */}
      <FlatList
        data={filteredRoles}
        renderItem={renderRoleItem}
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

export default RolesListScreen;