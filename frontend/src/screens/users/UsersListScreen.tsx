import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  ListRenderItem
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle } from 'react-native-svg';
import { urlService } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  UsersListScreen: undefined;
  UserSettings: { user: User };
};

type UsersListScreenProps = NativeStackScreenProps<RootStackParamList, 'UsersListScreen'>;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  lastSeen: string;
  user_name: string;
  phone: string;
  gender: string;
  created_at: string;
}

interface Colors {
  background: string;
  text: string;
  textSecondary: string;
  surface: string;
  border: string;
  primary: string;
}

const getStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  userCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  lastSeen: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
  },
});

const UsersListScreen: React.FC<UsersListScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const styles = getStyles(colors);

  // Merkezi URL servisi kullanılıyor

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      
      if (response.success && response.data && response.data.users) {
        // Backend'den gelen veriyi frontend formatına dönüştür
        const formattedUsers: User[] = response.data.users.map((user: any) => {
          // Profil resmi URL'sini oluştur
          let avatarUrl: string | null = null;
          if (user.profile_picture && user.profile_picture !== 'default.jpg' && user.profile_picture !== null) {
            const backendUrl = urlService.getImageUrl();
            avatarUrl = `${backendUrl}/uploads/images/avatars/${user.profile_picture}`;
          }

          return {
            id: user.user_id || user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name,
            email: user.email,
            role: user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı',
            avatar: avatarUrl,
            isActive: true, // Backend'de aktiflik durumu yoksa varsayılan true
            lastSeen: 'Bilinmiyor', // Backend'de son görülme yoksa varsayılan
            user_name: user.user_name,
            phone: user.phone,
            gender: user.gender,
            created_at: user.created_at
          };
        });
        
        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      setLoading(false);
      Alert.alert('Hata', error.message || 'Kullanıcılar yüklenirken bir hata oluştu.');
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const filterUsers = (): void => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'Admin':
        return '#FF6B6B';
      case 'Moderatör':
        return '#4ECDC4';
      case 'Kullanıcı':
        return '#45B7D1';
      default:
        return colors.text;
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserPress = (user: User): void => {
    // Kullanıcı ayarları sayfasına yönlendirme
    console.log('Kullanıcı seçildi:', user.name);
    navigation.navigate('UserSettings', { user: user });
  };

  const renderUserItem: ListRenderItem<User> = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {item.avatar && typeof item.avatar === 'string' && item.avatar.trim() !== '' ? (
            <Image 
              source={{ uri: item.avatar }} 
              style={styles.avatar}
              onError={() => {
                console.log('Profil resmi yüklenemedi:', item.avatar);
              }}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            </View>
          )}
          {item.isActive && <View style={styles.activeIndicator} />}
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.roleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {item.role}
              </Text>
            </View>
            <Text style={styles.lastSeen}>{item.lastSeen}</Text>
          </View>
        </View>
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
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx="12"
          cy="7"
          r="4"
          stroke={colors.textSecondary}
          strokeWidth="2"
        />
      </Svg>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Arama kriterlerine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı bulunmuyor'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Kullanıcı Listesi</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userCount}>{filteredUsers.length} kullanıcı</Text>
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
            placeholder="Kullanıcı ara..."
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

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
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

export default UsersListScreen;
export type { UsersListScreenProps, User };