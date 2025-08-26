import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { clubService, gymsService } from '../../services';

// Type definitions
interface CreateGymScreenProps {
  navigation: any;
  route: any;
}

interface Colors {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
  surface: string;
  border: string;
  error?: string;
}

interface Club {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  status: string;
}

interface FormData {
  clubId: string | null;
  name: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  timezone: string;
  isPublic: boolean;
  status: string;
}

const CreateGymScreen: React.FC<CreateGymScreenProps> = ({ navigation, route }) => {
  const { colors }: { colors: Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  
  // Kulüp seçme state'leri
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubModalVisible, setClubModalVisible] = useState<boolean>(false);
  const [clubsLoading, setClubsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    clubId: null,
    name: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    timezone: 'Europe/Istanbul',
    isPublic: true,
    status: 'active'
  });

  // Kulüpleri yükle
  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async (): Promise<void> => {
    try {
      setClubsLoading(true);
      const response = await clubService.getAllClubs();
      if (response.success) {
        setClubs(response.data || []);
      } else {
        console.error('Kulüpler yüklenemedi:', response.message);
      }
    } catch (error) {
      console.error('Kulüpler yüklenirken hata:', error);
    } finally {
      setClubsLoading(false);
    }
  };

  const selectClub = (club: Club): void => {
    setSelectedClub(club);
    setFormData(prev => ({ ...prev, clubId: club.id }));
    setClubModalVisible(false);
    setSearchQuery(''); // Arama kutusunu temizle
  };

  // Filtrelenmiş kulüp listesi
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateFormData = (field: keyof FormData, value: string | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Hata', 'Spor salonu adı gereklidir.');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Hata', 'Telefon numarası gereklidir.');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Hata', 'E-posta adresi gereklidir.');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Hata', 'Şehir gereklidir.');
      return false;
    }
    if (!formData.addressLine1.trim()) {
      Alert.alert('Hata', 'Adres gereklidir.');
      return false;
    }
    return true;
  };

  const handleCreateGym = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // API çağrısı için veri hazırlama
      const gymData = {
        club_id: formData.clubId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || null,
        city: formData.city,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2 || null,
        postal_code: formData.postalCode || null,
        timezone: formData.timezone,
        is_public: formData.isPublic,
        status: formData.status
      };

      const response = await gymsService.createGym(gymData);
      
      if (response.success) {
        Alert.alert(
          'Başarılı',
          'Spor salonu başarıyla oluşturuldu.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Hata', response.message || 'Spor salonu oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Gym creation error:', error);
      Alert.alert('Hata', 'Spor salonu oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderClubItem = ({ item }: { item: Club }) => (
    <TouchableOpacity
      style={styles.clubItem}
      onPress={() => selectClub(item)}
    >
      <View style={styles.clubItemContent}>
        <Text style={styles.clubItemName}>{item.name}</Text>
        <Text style={styles.clubItemDetails}>{item.email}</Text>
        <Text style={styles.clubItemDetails}>{item.phone}</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      paddingHorizontal: 20,
      paddingTop: insets.top + 10,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    requiredLabel: {
      color: colors.error || '#FF6B6B',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    clubSelector: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    clubSelectorText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    clubSelectorPlaceholder: {
      color: colors.textSecondary,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    switchLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    switchDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    createButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
      marginBottom: 16,
    },
    clubItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clubItemContent: {
      flex: 1,
    },
    clubItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    clubItemDetails: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19L5 12L12 5"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Spor Salonu</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Kulüp Seçimi</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bağlı Kulüp (Opsiyonel)</Text>
          <TouchableOpacity
            style={styles.clubSelector}
            onPress={() => setClubModalVisible(true)}
          >
            <Text style={[
              styles.clubSelectorText,
              !selectedClub && styles.clubSelectorPlaceholder
            ]}>
              {selectedClub ? selectedClub.name : 'Kulüp seçin'}
            </Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9L12 15L18 9"
                stroke={colors.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Spor Salonu Adı *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Spor salonu adını girin"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Telefon *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Telefon numarasını girin"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>E-posta *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="E-posta adresini girin"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={formData.website}
            onChangeText={(value) => updateFormData('website', value)}
            placeholder="Website adresini girin"
            placeholderTextColor={colors.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.sectionTitle}>Adres Bilgileri</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Şehir *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(value) => updateFormData('city', value)}
            placeholder="Şehir adını girin"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Adres Satır 1 *</Text>
          <TextInput
            style={styles.input}
            value={formData.addressLine1}
            onChangeText={(value) => updateFormData('addressLine1', value)}
            placeholder="Ana adres bilgisini girin"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adres Satır 2</Text>
          <TextInput
            style={styles.input}
            value={formData.addressLine2}
            onChangeText={(value) => updateFormData('addressLine2', value)}
            placeholder="Ek adres bilgisini girin"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Posta Kodu</Text>
          <TextInput
            style={styles.input}
            value={formData.postalCode}
            onChangeText={(value) => updateFormData('postalCode', value)}
            placeholder="Posta kodunu girin"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.sectionTitle}>Ayarlar</Text>

        <View style={styles.inputGroup}>
          <View style={styles.switchContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Herkese Açık</Text>
              <Text style={styles.switchDescription}>
                Spor salonu herkese açık olarak görüntülensin
              </Text>
            </View>
            <Switch
              value={formData.isPublic}
              onValueChange={(value) => updateFormData('isPublic', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={formData.isPublic ? '#FFFFFF' : colors.textSecondary}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateGym}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Spor Salonu Oluştur</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Kulüp Seçim Modal */}
      <Modal
        visible={clubModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setClubModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kulüp Seç</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setClubModalVisible(false)}
              >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 6L6 18M6 6L18 18"
                    stroke={colors.text}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Kulüp ara..."
              placeholderTextColor={colors.textSecondary}
            />

            {clubsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredClubs}
                renderItem={renderClubItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'Arama kriterinize uygun kulüp bulunamadı' : 'Henüz kulüp bulunmuyor'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateGymScreen;
export type { CreateGymScreenProps, Club, FormData };