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
import { FONTS } from '../../constants';
import { clubService } from '../../services';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  ClubsListScreen: undefined;
  ClubSettingsScreen: { clubId: number };
};

type ClubsListScreenProps = NativeStackScreenProps<RootStackParamList, 'ClubsListScreen'>;

interface Club {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  logo?: string | null;
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
  clubCount: {
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
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
  },
  logoText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  clubEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  clubInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clubPhone: {
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
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

const ClubsListScreen: React.FC<ClubsListScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const styles = getStyles(colors);

  // Merkezi URL servisi kullanılıyor

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [searchQuery, clubs]);

  const loadClubs = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await clubService.getAllClubs();
      if (response.success) {
        setClubs(response.data);
      } else {
        Alert.alert('Hata', response.message || 'Kulüpler yüklenirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Load clubs error:', error);
      Alert.alert('Hata', error.message || 'Kulüpler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true);
      await loadClubs();
    } finally {
      setRefreshing(false);
    }
  };

  const filterClubs = (): void => {
    if (!searchQuery.trim()) {
      setFilteredClubs(clubs);
      return;
    }

    const filtered = clubs.filter(club => 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.phone.includes(searchQuery)
    );
    setFilteredClubs(filtered);
  };

  const getStatusColor = (status: string): string => {
    return status === 'active' ? '#4CAF50' : '#FF6B6B';
  };

  const getStatusText = (status: string): string => {
    return status === 'active' ? 'Aktif' : 'Pasif';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClubPress = (club: Club): void => {
    // Kulüp ayarları sayfasına yönlendirme
    navigation.navigate('ClubSettingsScreen', { clubId: club.id });
  };

  const renderClubItem: ListRenderItem<Club> = ({ item }) => (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={() => handleClubPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.clubInfo}>
        <View style={styles.logoContainer}>
          {item.logo ? (
            <Image 
              source={{ uri: urlService.getImageUrlWithTimestamp(`/uploads/images/logos/${item.logo}`) }} 
              style={styles.logo}
              onError={() => {
                console.log('Kulüp logosu yüklenemedi:', item.logo);
              }}
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{getInitials(item.name)}</Text>
            </View>
          )}
        </View>

        <View style={styles.clubDetails}>
          <Text style={styles.clubName}>{item.name}</Text>
          <Text style={styles.clubEmail}>{item.email}</Text>
          <View style={styles.clubInfoRow}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.clubPhone}>{item.phone}</Text>
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
          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 22V12H15V22"
          stroke={colors.textSecondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Arama kriterlerine uygun kulüp bulunamadı' : 'Henüz kulüp bulunmuyor'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Kulüpler yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Kulüp Listesi</Text>
        <View style={styles.headerRight}>
          <Text style={styles.clubCount}>{filteredClubs.length} kulüp</Text>
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
            placeholder="Kulüp ara..."
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

      {/* Clubs List */}
      <FlatList
        data={filteredClubs}
        renderItem={renderClubItem}
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

export default ClubsListScreen;
export type { ClubsListScreenProps, Club };