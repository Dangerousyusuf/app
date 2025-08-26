import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { gymsService } from '../../services';
import clubsService from '../../services/clubsService';

// Type definitions
interface GymSettingsScreenProps {
  route: {
    params: {
      gymId: string;
    };
  };
  navigation: any;
}

interface Colors {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
  surface: string;
  border: string;
  white: string;
  error: string;
  success: string;
  warning?: string;
  info?: string;
}

interface Club {
  id: string;
  name: string;
  relationship_type: 'ownership' | 'partnership' | 'franchise';
}

interface Gym {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  timezone?: string;
  is_public?: boolean;
  description?: string;
  website?: string;
  capacity?: number;
  area_sqm?: number;
  parking_available?: boolean;
  wifi_available?: boolean;
  air_conditioning?: boolean;
  shower_facilities?: boolean;
  locker_rooms?: boolean;
  personal_training?: boolean;
  group_classes?: boolean;
  nutritionist?: boolean;
  physiotherapy?: boolean;
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  clubs?: Club[];
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  description: string;
  website: string;
  capacity: string;
  area_sqm: string;
  parking_available: boolean;
  wifi_available: boolean;
  air_conditioning: boolean;
  shower_facilities: boolean;
  locker_rooms: boolean;
  personal_training: boolean;
  group_classes: boolean;
  nutritionist: boolean;
  physiotherapy: boolean;
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
}

interface Facility {
  key: keyof FormData;
  label: string;
  icon: string;
}

interface StatusOption {
  value: 'active' | 'inactive' | 'maintenance' | 'closed';
  label: string;
  icon: string;
  color: string;
}

interface RelationshipType {
  value: 'ownership' | 'partnership' | 'franchise';
  label: string;
  description: string;
}

type TabType = 'general' | 'facilities' | 'status';

const GymSettingsScreen: React.FC<GymSettingsScreenProps> = ({ route, navigation }) => {
  const { gymId } = route.params;
  const { theme, colors }: { theme: any; colors: Colors } = useTheme();
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [clubModalVisible, setClubModalVisible] = useState<boolean>(false);
  const [relationshipModalVisible, setRelationshipModalVisible] = useState<boolean>(false);
  const [selectedClubForEdit, setSelectedClubForEdit] = useState<Club | null>(null);
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    description: '',
    website: '',
    capacity: '',
    area_sqm: '',
    parking_available: false,
    wifi_available: false,
    air_conditioning: false,
    shower_facilities: false,
    locker_rooms: false,
    personal_training: false,
    group_classes: false,
    nutritionist: false,
    physiotherapy: false,
    status: 'active'
  });

  useEffect(() => {
    loadGymDetails();
  }, [gymId]);

  // Adres alanları değiştiğinde tam adresi güncelle
  useEffect(() => {
    if (gym) {
      const addressParts = [
        formData.addressLine1,
        formData.addressLine2,
        formData.city,
        formData.postalCode
      ].filter(part => part && part.trim() !== '');
      
      const updatedAddress = addressParts.join(', ');
      
      setGym(prevGym => ({
        ...prevGym!,
        address: updatedAddress
      }));
    }
  }, [formData.city, formData.addressLine1, formData.addressLine2, formData.postalCode]);

  const loadGymDetails = async (): Promise<void> => {
    try {
      setInitialLoading(true);
      const response = await gymsService.getGymById(gymId);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      const gymData = response.data;
      setGym(gymData);
      
      setFormData({
        name: gymData.name || '',
        phone: gymData.phone || '',
        email: gymData.email || '',
        city: gymData.city || '',
        addressLine1: gymData.address_line_1 || '',
        addressLine2: gymData.address_line_2 || '',
        postalCode: gymData.postal_code || '',
        description: gymData.description || '',
        website: gymData.website || '',
        capacity: gymData.capacity?.toString() || '',
        area_sqm: gymData.area_sqm?.toString() || '',
        parking_available: gymData.parking_available || false,
        wifi_available: gymData.wifi_available || false,
        air_conditioning: gymData.air_conditioning || false,
        shower_facilities: gymData.shower_facilities || false,
        locker_rooms: gymData.locker_rooms || false,
        personal_training: gymData.personal_training || false,
        group_classes: gymData.group_classes || false,
        nutritionist: gymData.nutritionist || false,
        physiotherapy: gymData.physiotherapy || false,
        status: gymData.status || 'active'
      });
    } catch (error) {
      console.error('Salon detayları yüklenirken hata:', error);
      Alert.alert('Hata', 'Salon bilgileri yüklenemedi');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      setSaving(true);
      const updateData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
        // Ayrı adres alanlarını backend'e gönder
        city: formData.city,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        postal_code: formData.postalCode,
        timezone: gym?.timezone || 'Europe/Istanbul',
        is_public: gym?.is_public !== undefined ? gym.is_public : true
      };
      
      await gymsService.updateGym(gymId, updateData);
      Alert.alert('Başarılı', 'Salon bilgileri güncellendi');
      await loadGymDetails();
    } catch (error) {
      console.error('Salon güncellenirken hata:', error);
      Alert.alert('Hata', 'Salon bilgileri güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const loadAvailableClubs = async (): Promise<void> => {
    try {
      const response = await clubsService.getAllClubs();
      if (response.success) {
        // Sadece bu salona bağlı olmayan kulüpleri göster
        const currentClubIds = gym?.clubs?.map(club => club.id) || [];
        const availableClubs = response.data.filter((club: Club) => !currentClubIds.includes(club.id));
        setAvailableClubs(availableClubs);
      } else {
        Alert.alert('Hata', response.message || 'Kulüpler yüklenemedi');
      }
    } catch (error) {
      console.error('Kulüpler yüklenirken hata:', error);
      Alert.alert('Hata', 'Kulüpler yüklenemedi');
    }
  };

  const handleRemoveClub = async (clubId: string): Promise<void> => {
    console.log('handleRemoveClub called with clubId:', clubId, 'gymId:', gymId);
    Alert.alert(
      'Kulübü Kaldır',
      'Bu kulübü salondan kaldırmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Calling removeClubFromGym with gymId:', gymId, 'clubId:', clubId);
              const response = await gymsService.removeClubFromGym(gymId, clubId);
              if (response.success) {
                await loadGymDetails(); // Refresh data
                Alert.alert('Başarılı', 'Kulüp başarıyla kaldırıldı');
              } else {
                Alert.alert('Hata', response.message || 'Kulüp kaldırılamadı');
              }
            } catch (error) {
              console.error('Kulüp kaldırılırken hata:', error);
              Alert.alert('Hata', 'Kulüp kaldırılamadı');
            }
          }
        }
      ]
    );
  };

  const handleAddClub = async (clubId: string, relationshipType: string): Promise<void> => {
    try {
      const response = await gymsService.addClubToGym(gymId, clubId, relationshipType);
      if (response.success) {
        await loadGymDetails(); // Refresh data
        setClubModalVisible(false);
        Alert.alert('Başarılı', 'Kulüp başarıyla eklendi');
      } else {
        Alert.alert('Hata', response.message || 'Kulüp eklenemedi');
      }
    } catch (error) {
      console.error('Kulüp eklenirken hata:', error);
      Alert.alert('Hata', 'Kulüp eklenemedi');
    }
  };

  const handleEditRelationship = (club: Club): void => {
    setSelectedClubForEdit(club);
    setRelationshipModalVisible(true);
  };

  const handleUpdateRelationship = async (newRelationshipType: string): Promise<void> => {
    try {
      // Önce eski ilişkiyi kaldır
      await gymsService.removeClubFromGym(gymId, selectedClubForEdit!.id);
      // Yeni ilişki tipini ekle
      const response = await gymsService.addClubToGym(gymId, selectedClubForEdit!.id, newRelationshipType);
      if (response.success) {
        await loadGymDetails();
        setRelationshipModalVisible(false);
        setSelectedClubForEdit(null);
        Alert.alert('Başarılı', 'İlişki tipi güncellendi');
      } else {
        Alert.alert('Hata', response.message || 'İlişki tipi güncellenemedi');
      }
    } catch (error) {
      console.error('İlişki tipi güncellenirken hata:', error);
      Alert.alert('Hata', 'İlişki tipi güncellenemedi');
    }
  };

  const renderClubModal = (): JSX.Element => {
    return (
      <Modal
        visible={clubModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setClubModalVisible(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>İptal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Kulüp Yönetimi</Text>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Current Clubs */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Mevcut Kulüpler</Text>
              {gym?.clubs && gym.clubs.length > 0 ? (
                gym.clubs.map((club) => (
                  <View key={club.id} style={[styles.modalClubCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <View style={styles.modalClubInfo}>
                      <Text style={[styles.modalClubName, { color: colors.text }]}>{club.name}</Text>
                      <Text style={[styles.modalClubRelation, { color: colors.textSecondary }]}>
                        {club.relationship_type === 'ownership' ? 'Sahiplik' : 
                         club.relationship_type === 'partnership' ? 'Ortaklık' : 'Franchise'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: colors.error }]}
                      onPress={() => handleRemoveClub(club.id)}
                    >
                      <Text style={[styles.removeButtonText, { color: colors.white }]}>Kaldır</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyClubText, { color: colors.textSecondary }]}>Henüz bağlı kulüp yok</Text>
              )}
            </View>

            {/* Available Clubs */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Kullanılabilir Kulüpler</Text>
              <TouchableOpacity
                style={[styles.loadClubsButton, { backgroundColor: colors.primary }]}
                onPress={loadAvailableClubs}
              >
                <Text style={[styles.loadClubsButtonText, { color: colors.white }]}>Kulüpleri Yükle</Text>
              </TouchableOpacity>
              
              {availableClubs.map((club) => (
                <View key={`available-${club.id}`} style={[styles.modalClubCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <View style={styles.modalClubInfo}>
                    <Text style={[styles.modalClubName, { color: colors.text }]}>{club.name}</Text>
                    <Text style={[styles.modalClubRelation, { color: colors.textSecondary }]}>Kullanılabilir</Text>
                  </View>
                  <View style={styles.addClubActions}>
                    <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: colors.success }]}
                      onPress={() => handleAddClub(club.id, 'ownership')}
                    >
                      <Text style={[styles.addButtonText, { color: colors.white }]}>Sahiplik</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleAddClub(club.id, 'partnership')}
                    >
                      <Text style={[styles.addButtonText, { color: colors.white }]}>Ortaklık</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: colors.warning || '#F59E0B' }]}
                      onPress={() => handleAddClub(club.id, 'franchise')}
                    >
                      <Text style={[styles.addButtonText, { color: colors.white }]}>Franchise</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderRelationshipModal = (): JSX.Element => {
    const relationshipTypes: RelationshipType[] = [
      { value: 'ownership', label: 'Sahiplik', description: 'Salon kulübün mülkiyetindedir' },
      { value: 'partnership', label: 'Ortaklık', description: 'Salon kulüp ile ortaklık halindedir' },
      { value: 'franchise', label: 'Franchise', description: 'Salon kulübün franchise\'ıdır' }
    ];

    return (
      <Modal
        visible={relationshipModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setRelationshipModalVisible(false);
                setSelectedClubForEdit(null);
              }}
            >
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>İptal</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>İlişki Tipi Düzenle</Text>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Kulüp: {selectedClubForEdit?.name}</Text>
              <Text style={[styles.modalSectionSubtitle, { color: colors.textSecondary }]}>Yeni ilişki tipini seçin:</Text>
              
              {relationshipTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.relationshipOption,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface
                    }
                  ]}
                  onPress={() => handleUpdateRelationship(type.value)}
                >
                  <View style={styles.relationshipInfo}>
                    <Text style={[styles.relationshipLabel, { color: colors.text }]}>{type.label}</Text>
                    <Text style={[styles.relationshipDescription, { color: colors.textSecondary }]}>{type.description}</Text>
                  </View>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M9 18L15 12L9 6"
                      stroke={colors.textSecondary}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderTabButton = (tabId: TabType, title: string, icon: JSX.Element): JSX.Element => {
    const isActive = activeTab === tabId;
    return (
      <TouchableOpacity
        key={tabId}
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? colors.primary : 'transparent',
            borderColor: isActive ? colors.primary : colors.border
          }
        ]}
        onPress={() => setActiveTab(tabId)}
      >
        <View style={styles.tabIcon}>
          {icon}
        </View>
        <Text style={[
          styles.tabText,
          { color: isActive ? colors.white : colors.text }
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGeneralTab = (): JSX.Element => {
    return (
      <View style={styles.tabContent}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Temel Bilgiler</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Salon Adı</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Salon adını girin"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Telefon</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Telefon numarası"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>E-posta</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="E-posta adresi"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Adres Bilgileri */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Adres Bilgileri</Text>
            
            {/* Birleştirilmiş Adres (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Tam Adres</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.textSecondary, backgroundColor: colors.surface }]}
                value={gym?.address || ''}
                editable={false}
                placeholder="Tam adres bilgisi"
                placeholderTextColor={colors.textSecondary}
                multiline={true}
                numberOfLines={2}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Şehir</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Şehir"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Adres Satırı 1</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.addressLine1}
                onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
                placeholder="Sokak, cadde, mahalle"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Adres Satırı 2 (Opsiyonel)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.addressLine2}
                onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
                placeholder="Apartman, daire, kat bilgisi"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Posta Kodu</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.postalCode}
                onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
                placeholder="Posta kodu"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Açıklama</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Salon hakkında açıklama"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Website</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.website}
                onChangeText={(text) => setFormData({ ...formData, website: text })}
                placeholder="Website URL'si"
                placeholderTextColor={colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Kapasite</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.capacity}
                onChangeText={(text) => setFormData({ ...formData, capacity: text })}
                placeholder="Kişi sayısı"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Alan (m²)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                value={formData.area_sqm}
                onChangeText={(text) => setFormData({ ...formData, area_sqm: text })}
                placeholder="Metrekare"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Associated Club */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bağlı Kulüp</Text>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => setClubModalVisible(true)}
            >
              <Text style={[styles.editButtonText, { color: colors.white }]}>Düzenle</Text>
            </TouchableOpacity>
          </View>
          
          {gym?.clubs && gym.clubs.length > 0 ? (
            gym.clubs.map((club) => (
              <View key={club.id} style={[styles.clubCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <View style={styles.clubHeader}>
                  <View style={[styles.clubIcon, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.clubIconText, { color: colors.white }]}>🏢</Text>
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={[styles.clubName, { color: colors.text }]}>{club.name}</Text>
                    <Text style={[styles.clubRelation, { color: colors.textSecondary }]}>
                      {club.relationship_type === 'ownership' ? 'Sahiplik' : 
                       club.relationship_type === 'partnership' ? 'Ortaklık' : 'Franchise'}
                    </Text>
                  </View>
                  <View style={styles.clubActions}>
                    <TouchableOpacity
                      style={[styles.editRelationshipButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleEditRelationship(club)}
                    >
                      <Text style={[styles.editRelationshipText, { color: colors.white }]}>Düzenle</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyClubCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyClubText, { color: colors.textSecondary }]}>Henüz bağlı kulüp yok</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFacilitiesTab = (): JSX.Element => {
    const facilities: Facility[] = [
      { key: 'parking_available', label: 'Otopark', icon: '🚗' },
      { key: 'wifi_available', label: 'Wi-Fi', icon: '📶' },
      { key: 'air_conditioning', label: 'Klima', icon: '❄️' },
      { key: 'shower_facilities', label: 'Duş', icon: '🚿' },
      { key: 'locker_rooms', label: 'Soyunma Odası', icon: '🚪' },
      { key: 'personal_training', label: 'Kişisel Antrenman', icon: '💪' },
      { key: 'group_classes', label: 'Grup Dersleri', icon: '👥' },
      { key: 'nutritionist', label: 'Beslenme Uzmanı', icon: '🥗' },
      { key: 'physiotherapy', label: 'Fizyoterapi', icon: '🏥' }
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Olanaklar</Text>
          
          {facilities.map((facility) => (
            <View key={facility.key} style={[styles.switchRow, { borderBottomColor: colors.border }]}>
              <View style={styles.switchLeft}>
                <Text style={styles.facilityIcon}>{facility.icon}</Text>
                <Text style={[styles.switchLabel, { color: colors.text }]}>{facility.label}</Text>
              </View>
              <Switch
                value={formData[facility.key] as boolean}
                onValueChange={(value) => setFormData({ ...formData, [facility.key]: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={formData[facility.key] ? colors.white : colors.textSecondary}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStatusTab = (): JSX.Element => {
    const statusOptions: StatusOption[] = [
      { value: 'active', label: 'Aktif', icon: '✅', color: colors.success },
      { value: 'inactive', label: 'Pasif', icon: '⏸️', color: colors.warning || '#F59E0B' },
      { value: 'maintenance', label: 'Bakımda', icon: '🔧', color: colors.info || '#3B82F6' },
      { value: 'closed', label: 'Kapalı', icon: '🚫', color: colors.error }
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Salon Durumu</Text>
          
          <View style={styles.statusContainer}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusOption,
                  {
                    borderColor: formData.status === status.value ? status.color : colors.border,
                    backgroundColor: formData.status === status.value ? `${status.color}20` : colors.surface
                  }
                ]}
                onPress={() => setFormData({ ...formData, status: status.value })}
              >
                <Text style={styles.statusIcon}>{status.icon}</Text>
                <Text style={[
                  styles.statusLabel,
                  {
                    color: formData.status === status.value ? status.color : colors.text,
                    fontWeight: formData.status === status.value ? '600' : '400'
                  }
                ]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Salon bilgileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
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

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Salon Ayarları</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{gym?.name}</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.white }]}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {renderTabButton('general', 'Genel', 
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke={activeTab === 'general' ? colors.white : colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M2 17L12 22L22 17"
                stroke={activeTab === 'general' ? colors.white : colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M2 12L12 17L22 12"
                stroke={activeTab === 'general' ? colors.white : colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
          {renderTabButton('facilities', 'Olanaklar',
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke={activeTab === 'facilities' ? colors.white : colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M9 22V12H15V22"
                stroke={activeTab === 'facilities' ? colors.white : colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
          {renderTabButton('status', 'Durum',
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle
                cx={12}
                cy={12}
                r={10}
                stroke={activeTab === 'status' ? colors.white : colors.text}
                strokeWidth={2}
              />
              <Path
                d="M12 6V12L16 14"
                stroke={activeTab === 'status' ? colors.white : colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'facilities' && renderFacilitiesTab()}
        {activeTab === 'status' && renderStatusTab()}
      </ScrollView>

      {/* Club Modal */}
      {renderClubModal()}
      
      {/* Relationship Modal */}
      {renderRelationshipModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  backButton: {
    padding: 8,
    marginRight: 12
  },
  headerCenter: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  tabsContainer: {
  },
  tabs: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8
  },
  tabIcon: {
    width: 20,
    height: 20
  },
  tabText: {
    fontSize: 14
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 20
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 16,
    flex: 1
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: 16
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  facilityIcon: {
    fontSize: 20
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  statusContainer: {
    gap: 12
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12
  },
  statusIcon: {
    fontSize: 20
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  clubCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  clubIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  clubIconText: {
    fontSize: 20
  },
  clubInfo: {
    flex: 1
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  clubRelation: {
    fontSize: 14,
    fontWeight: '500'
  },
  emptyClubCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12
  },
  emptyClubText: {
    fontSize: 14,
    fontStyle: 'italic'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500'
  },
  // Modal styles
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  modalCloseButton: {
    minWidth: 60
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '500'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20
  },
  modalSection: {
    marginTop: 24
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  modalClubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  modalClubInfo: {
    flex: 1
  },
  modalClubName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  modalClubRelation: {
    fontSize: 14
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '500'
  },
  addClubActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  loadClubsButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  clubActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  editRelationshipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  editRelationshipText: {
    fontSize: 12,
    fontWeight: '500'
  },
  relationshipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  relationshipInfo: {
    flex: 1
  },
  relationshipLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  relationshipDescription: {
    fontSize: 14
  },
  modalSectionSubtitle: {
    fontSize: 14,
    marginBottom: 16
  },
  loadClubsButtonText: {
    fontSize: 16,
    fontWeight: '500'
  }
});

export default GymSettingsScreen;
export type { GymSettingsScreenProps, Gym, Club, FormData };