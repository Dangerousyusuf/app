import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { gymsService } from '../../services';

interface GymsListScreenProps {
  navigation: any;
}

interface Colors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface Club {
  id: number;
  club_name: string;
  relationship_type: 'ownership' | 'partnership' | 'franchise' | string;
}

interface Gym {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'maintenance';
  clubs?: Club[];
}

const GymsListScreen: React.FC<GymsListScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getStyles = (colors: Colors) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    headerRight: {
      alignItems: 'flex-end',
    },
    gymCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
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
      paddingVertical: 0,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    listContainer: {
      paddingVertical: 8,
    },
    gymItem: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginVertical: 6,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    gymHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    gymInitials: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    gymInitialsText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.surface,
    },
    gymInfo: {
      flex: 1,
    },
    gymName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    gymLocation: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    gymContact: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    gymDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    gymClub: {
      flex: 1,
    },
    gymClubLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    gymClubName: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    gymRelationType: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    actionButton: {
      padding: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
    },
    emptyTitle: {
      marginTop: 20,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    emptySubtitle: {
      marginTop: 8,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  const styles = getStyles(colors);

  useEffect(() => {
    loadGyms();
  }, []);

  useEffect(() => {
    filterGyms();
  }, [searchQuery, gyms]);

  const loadGyms = async (): Promise<void> => {
    try {
      console.log('loadGyms fonksiyonu çağrıldı');
      setLoading(true);
      console.log('gymsService.getAllGyms() çağrılıyor...');
      const response = await gymsService.getAllGyms();
      console.log('gymsService.getAllGyms() yanıtı:', response);
      if (response.success) {
        console.log('Salonlar başarıyla yüklendi:', response.data);
        setGyms(response.data);
      } else {
        console.log('Salon yükleme hatası:', response.message);
        Alert.alert('Hata', response.message || 'Salonlar yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Salonlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Salonlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterGyms = (): void => {
    if (!searchQuery.trim()) {
      setFilteredGyms(gyms);
      return;
    }

    const filtered = gyms.filter(gym => 
      gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.phone?.includes(searchQuery) ||
      gym.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGyms(filtered);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#EF4444';
      case 'maintenance':
        return '#F59E0B';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'maintenance':
        return 'Bakım';
      default:
        return 'Bilinmiyor';
    }
  };

  const handleGymPress = (gym: Gym): void => {
    navigation.navigate('GymSettings', { gymId: gym.id });
  };

  const renderGymItem = ({ item }: { item: Gym }) => (
    <TouchableOpacity
      style={styles.gymItem}
      onPress={() => handleGymPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.gymHeader}>
        <View style={styles.gymInitials}>
          <Text style={styles.gymInitialsText}>
            {getInitials(item.name)}
          </Text>
        </View>
        
        <View style={styles.gymInfo}>
          <Text style={styles.gymName}>{item.name}</Text>
          <Text style={styles.gymLocation}>{item.address}</Text>
          <Text style={styles.gymContact}>{item.phone}</Text>
        </View>
      </View>
      
      <View style={styles.gymDetails}>
        <View style={styles.gymClub}>
          <Text style={styles.gymClubLabel}>Kulüp/Bayi</Text>
          <Text style={styles.gymClubName}>
            {item.clubs && item.clubs.length > 0 ? item.clubs[0].club_name : 'Bağımsız'}
          </Text>
          {item.clubs && item.clubs.length > 0 && (
            <Text style={styles.gymRelationType}>
              {item.clubs[0].relationship_type === 'ownership' ? 'Sahiplik' : 
               item.clubs[0].relationship_type === 'partnership' ? 'Ortaklık' : 
               item.clubs[0].relationship_type === 'franchise' ? 'Franchise' : item.clubs[0].relationship_type}
            </Text>
          )}
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {getStatusText(item.status)}
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
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <Path
          d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
          fill={colors.textSecondary}
        />
        <Path
          d="M12 7C10.9 7 10 7.9 10 9S10.9 11 12 11 14 10.1 14 9 13.1 7 12 7ZM12 13C9.33 13 7 14.33 7 17H17C17 14.33 14.67 13 12 13Z"
          fill={colors.textSecondary}
        />
      </Svg>
      <Text style={styles.emptyTitle}>Henüz salon bulunmuyor</Text>
      <Text style={styles.emptySubtitle}>Sistem yöneticisi tarafından salon eklendiğinde burada görünecektir.</Text>
    </View>
  );

  const onRefresh = (): void => {
    setRefreshing(true);
    loadGyms().finally(() => setRefreshing(false));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Salonlar yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Salon Listesi</Text>
        <View style={styles.headerRight}>
          <Text style={styles.gymCount}>{filteredGyms.length} salon</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
            <Circle cx="11" cy="11" r="8" stroke={colors.textSecondary} strokeWidth="2" />
            <Path d="M21 21L16.65 16.65" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Salon ara..."
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

      {/* Gym List */}
      <FlatList
        data={filteredGyms}
        renderItem={renderGymItem}
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

export default GymsListScreen;