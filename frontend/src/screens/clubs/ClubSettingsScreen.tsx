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
  Image,
  Platform,
  Modal,
  Switch,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONTS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { clubService, gymsService } from '../../services';
import { urlService } from '../../config/api';

// Type definitions
interface ClubSettingsScreenProps {
  navigation: any;
  route: {
    params: {
      clubId: string;
    };
  };
}

interface Colors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  text: string;
  textSecondary: string;
  border: string;
  white: string;
}

interface Club {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  description?: string;
  status: 'active' | 'inactive';
  logo?: string;
}

interface ClubOwner {
  id: string;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  profile_picture?: string;
}

interface Gym {
  id: string;
  name: string;
  address?: string;
  status: 'active' | 'inactive';
  logo?: string;
}

interface Module {
  id: number;
  name: string;
  description?: string;
  category: string;
  status: boolean;
}

interface Form {
  id: number;
  name: string;
  description?: string;
  category: string;
  status: boolean;
  fields: any[];
}

// Helper functions
const getModuleColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Üyelik': '#4CAF50',
    'Ödeme': '#2196F3',
    'Raporlama': '#FF9800',
    'İletişim': '#9C27B0',
    'Güvenlik': '#F44336',
    'Entegrasyon': '#607D8B'
  };
  return colors[category] || '#757575';
};

const getFormColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Üyelik': '#4CAF50',
    'Sağlık': '#2196F3',
    'Anket': '#FF9800',
    'Başvuru': '#9C27B0',
    'Değerlendirme': '#F44336'
  };
  return colors[category] || '#757575';
};

// Example data
const exampleModules: Module[] = [
  { id: 1, name: 'Üye Yönetimi', description: 'Üyelerin kaydı, düzenlenmesi ve takibi', category: 'Üyelik', status: true },
  { id: 2, name: 'Ödeme Sistemi', description: 'Ödeme işlemleri ve fatura yönetimi', category: 'Ödeme', status: false },
  { id: 3, name: 'Raporlama', description: 'Detaylı raporlar ve analizler', category: 'Raporlama', status: true },
  { id: 4, name: 'SMS/E-posta', description: 'Toplu mesaj gönderimi', category: 'İletişim', status: false },
  { id: 5, name: 'Güvenlik Kameraları', description: 'Kamera sistemi entegrasyonu', category: 'Güvenlik', status: false },
  { id: 6, name: 'Mobil Uygulama', description: 'Üyeler için mobil uygulama', category: 'Entegrasyon', status: true }
];

const exampleForms: Form[] = [
  { id: 1, name: 'Üyelik Formu', description: 'Yeni üye kayıt formu', category: 'Üyelik', status: true, fields: ['ad', 'soyad', 'telefon'] },
  { id: 2, name: 'Sağlık Formu', description: 'Sağlık durumu değerlendirme formu', category: 'Sağlık', status: false, fields: ['boy', 'kilo', 'hastalık'] },
  { id: 3, name: 'Memnuniyet Anketi', description: 'Üye memnuniyet anketi', category: 'Anket', status: true, fields: ['puan', 'yorum'] },
  { id: 4, name: 'PT Başvuru Formu', description: 'Personal trainer başvuru formu', category: 'Başvuru', status: false, fields: ['deneyim', 'sertifika'] },
  { id: 5, name: 'Performans Değerlendirme', description: 'Çalışan performans değerlendirme formu', category: 'Değerlendirme', status: false, fields: ['hedefler', 'başarı'] }
];

const ClubSettingsScreen: React.FC<ClubSettingsScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme() as { colors: Colors };
  const { clubId } = route.params;

  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [club, setClub] = useState<Club | null>(null);
  const [clubName, setClubName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState<boolean>(false);
  
  // Modal states
  const [modulesModalVisible, setModulesModalVisible] = useState<boolean>(false);
  const [formsModalVisible, setFormsModalVisible] = useState<boolean>(false);
  const [gymManagementModalVisible, setGymManagementModalVisible] = useState<boolean>(false);
  
  // Data states
  const [modules, setModules] = useState<Module[]>(exampleModules);
  const [forms, setForms] = useState<Form[]>(exampleForms);
  const [clubOwners, setClubOwners] = useState<ClubOwner[]>([]);
  const [ownersLoading, setOwnersLoading] = useState<boolean>(false);
  const [clubGyms, setClubGyms] = useState<Gym[]>([]);
  const [gymsLoading, setGymsLoading] = useState<boolean>(false);
  const [availableGyms, setAvailableGyms] = useState<Gym[]>([]);
  const [loadingAvailableGyms, setLoadingAvailableGyms] = useState<boolean>(false);
  const [gymsLoaded, setGymsLoaded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGymForRelationship, setSelectedGymForRelationship] = useState<Gym | null>(null);

  
  // UI states
  const [expandedModulesCard, setExpandedModulesCard] = useState<boolean>(false);
  const [expandedFormsCard, setExpandedFormsCard] = useState<boolean>(false);

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: 'transparent',
    },
    leftHeaderSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    topHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    bottomHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: FONTS.medium,
      color: colors.text,
      marginLeft: 12,
    },
    modalCloseButton: {
    },
    rightSidebarButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 14,
      fontFamily: FONTS.medium,
    },
    disabledButton: {
      opacity: 0.6,
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
    },
    formContainer: {
      padding: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      position: 'relative',
    },
    logoImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    logoLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      marginTop: 8,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: FONTS.regular,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    statusContainer: {
      marginBottom: 30,
    },
    statusToggleContainer: {
      flexDirection: 'row',
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 4,
    },
    statusOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    statusOptionActive: {
      backgroundColor: colors.success,
    },
    statusOptionInactive: {
      backgroundColor: colors.error,
    },
    statusText: {
      fontSize: 14,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    statusTextActive: {
      color: colors.white,
    },
    deleteButton: {
      backgroundColor: colors.error,
      paddingVertical: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    deleteButtonText: {
      color: colors.white,
      fontSize: 16,
      fontFamily: FONTS.medium,
    },
    // Statistics card styles
    statsCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    statsTitle: {
      fontSize: 18,
      fontFamily: FONTS.semiBold,
      color: colors.text,
    },
    detailButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    detailButtonText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
      color: colors.primary,
    },
    statsContent: {
      gap: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    // Dealers card styles
    dealersCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dealersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    dealersTitle: {
      fontSize: 18,
      fontFamily: FONTS.semiBold,
      color: colors.text,
    },
    dealersButtonGroup: {
      flexDirection: 'row',
      gap: 8,
    },
    connectButton: {
      backgroundColor: colors.success + '20',
    },
    connectButtonText: {
      color: colors.success,
    },
    dealersContent: {
      gap: 12,
    },
    dealerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dealerLogo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    dealerLogoImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    dealerLogoText: {
      fontSize: 14,
      fontFamily: FONTS.medium,
      color: colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    emptyStateSubText: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    dealerInfo: {
      flex: 1,
    },
    dealerName: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      color: colors.text,
      marginBottom: 4,
    },
    dealerLocation: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    dealerRight: {
      alignItems: 'flex-end',
      gap: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    activeBadge: {
      backgroundColor: colors.success + '20',
    },
    inactiveBadge: {
      backgroundColor: colors.error + '20',
    },
    statusBadgeText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
    },
    activeText: {
      color: colors.success,
    },
    inactiveText: {
      color: colors.error,
    },
    // Club owner card styles
    ownerCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    ownerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    ownerTitle: {
      fontSize: 18,
      fontFamily: FONTS.semiBold,
      color: colors.text,
    },
    ownerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ownerAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 16,
    },
    ownerAvatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    ownerAvatarText: {
      fontSize: 18,
      fontFamily: FONTS.medium,
      color: colors.primary,
    },
    ownerAvatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    ownerInfo: {
      flex: 1,
    },
    ownerName: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      color: colors.text,
      marginBottom: 2,
    },
    ownerRole: {
      fontSize: 12,
      fontFamily: FONTS.regular,
      color: colors.primary,
      marginBottom: 2,
    },
    ownerUsername: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    ownerEmail: {
      fontSize: 12,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    noOwnerContainer: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    noOwnerText: {
      fontSize: 14,
      fontFamily: FONTS.regular,
    },
    ownerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    contactButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    contactButtonText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
      color: colors.primary,
    },
    // İlişki butonları stilleri
    relationshipSection: {
      marginTop: 0,
      paddingTop: 16,
      paddingBottom: 0,
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
      width: '100%',
      alignItems: 'center',
    },
    relationshipTitle: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 12,
      textAlign: 'center',
      alignSelf: 'center',
    },
    relationshipButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    relationshipButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80,
    },
    relationshipButtonText: {
      fontSize: 14,
      fontFamily: FONTS.semiBold,
      textAlign: 'center',
    },
    // Module styles
    moduleItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    moduleName: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      color: colors.text,
    },
    moduleStatus: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    // Form setting styles
    formSettingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formSettingName: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      color: colors.text,
    },
    formSettingDesc: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    // Module chips styles
    addModuleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modulesChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    moduleChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    moduleChipText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
    },
    removeModuleButton: {
      padding: 2,
    },
    noModulesText: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 20,
    },
    viewAllModulesButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.border,
    },
    viewAllModulesText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    // Modal styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingTop: 50,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: FONTS.medium,
      textAlign: 'left',
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseButtonText: {
      fontSize: 18,
      fontFamily: FONTS.semiBold,
    },
    modalActionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    modalActionButtonText: {
      fontSize: 14,
      fontFamily: FONTS.medium,
    },
    loadingIndicator: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Permission item styles
    permissionsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    permissionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
    },
    permissionItemContent: {
      flex: 1,
    },
    permissionItemKey: {
      fontSize: 14,
      fontFamily: FONTS.semiBold,
      marginBottom: 4,
    },
    permissionItemDescription: {
      fontSize: 12,
      fontFamily: FONTS.regular,
      marginBottom: 2,
    },
    permissionItemModule: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      fontStyle: 'italic',
    },
    permissionSelectedIndicator: {
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
      fontFamily: FONTS.semiBold,
    },
    noRolesText: {
      fontSize: 16,
      fontFamily: FONTS.regular,
    },
    // Gym management modal styles (from GymSettingsScreen)
    modalCloseButton: {
      minWidth: 60,
    },
    modalCloseText: {
      fontSize: 16,
      fontFamily: FONTS.medium,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    modalSection: {
      marginBottom: 30,
    },
    modalSectionTitle: {
      fontSize: 18,
      fontFamily: FONTS.semiBold,
      marginBottom: 16,
    },
    modalClubCard: {
      flexDirection: 'column',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
      minHeight: 'auto',
    },
    modalClubInfo: {
      flex: 1,
      marginBottom: 12,
    },
    modalClubName: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      marginBottom: 4,
    },
    modalClubRelation: {
      fontSize: 14,
      fontFamily: FONTS.regular,
    },
    removeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-end',
    },
    removeButtonText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
    },
    addButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    addButtonText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
    },
    loadClubsButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    loadClubsButtonText: {
      fontSize: 14,
      fontFamily: FONTS.medium,
    },
    emptyClubText: {
      fontSize: 14,
      fontFamily: FONTS.regular,
      textAlign: 'center',
      paddingVertical: 20,
    },
    addClubActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    relationshipButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    relationshipButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    relationshipButtonText: {
      fontSize: 10,
      fontFamily: FONTS.medium,
    },
    searchInput: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      fontFamily: FONTS.regular,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
  });

  // useEffect hooks
  useEffect(() => {
    loadClubDetails();
    loadClubGyms();
    loadClubOwners();
  }, [clubId]);

  // Functions
  const loadClubDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await clubService.getClubById(clubId);
      if (response.success && response.data) {
        const clubData = response.data;
        setClub(clubData);
        setClubName(clubData.name || '');
        setPhone(clubData.phone || '');
        setEmail(clubData.email || '');
        setAddress(clubData.address || '');
        setDescription(clubData.description || '');
        setStatus(clubData.status || 'active');
        
        if (clubData.logo) {
          setLogoImage(urlService.getLogoUrl(clubData.logo));
        }
      }
    } catch (error) {
      console.error('Error loading club details:', error);
      Alert.alert('Hata', 'Kulüp bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadClubGyms = async (): Promise<void> => {
    try {
      setGymsLoading(true);
      const response = await clubService.getClubGyms(clubId);
      if (response.success && response.data) {
        setClubGyms(response.data);
      }
    } catch (error) {
      console.error('Error loading club gyms:', error);
    } finally {
      setGymsLoading(false);
    }
  };

  const loadAvailableGyms = async (): Promise<void> => {
    try {
      setLoadingAvailableGyms(true);
      const response = await gymsService.getAllGyms();
      if (response.success && response.data) {
        // Filter out gyms that are already connected to this club
        const connectedGymIds = clubGyms.map(gym => gym.id);
        const available = response.data.filter((gym: Gym) => !connectedGymIds.includes(gym.id));
        setAvailableGyms(available);
        setGymsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading available gyms:', error);
      Alert.alert('Hata', 'Salonlar yüklenirken bir hata oluştu.');
    } finally {
      setLoadingAvailableGyms(false);
    }
  };

  const loadClubOwners = async (): Promise<void> => {
    try {
      setOwnersLoading(true);
      const response = await clubService.getClubOwners(clubId);
      if (response.success && response.data) {
        setClubOwners(response.data);
      }
    } catch (error) {
      console.error('Error loading club owners:', error);
    } finally {
      setOwnersLoading(false);
    }
  };

  const filteredGyms = availableGyms.filter(gym =>
    gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (gym.address && gym.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConnectGym = (gym: Gym): void => {
    setSelectedGymForRelationship(gym);
  };

  const handleConnectWithRelationship = async (relationship: string): Promise<void> => {
    console.log('handleConnectWithRelationship called with:', { relationship, selectedGym: selectedGymForRelationship, clubId });
    
    if (!selectedGymForRelationship) {
      console.log('No selected gym for relationship');
      return;
    }
    
    try {
      console.log('Calling clubService.connectGym with:', { clubId, gymId: selectedGymForRelationship.id, relationship });
      const response = await clubService.connectGym(clubId, selectedGymForRelationship.id, relationship);
      console.log('connectGym response:', response);
      
      if (response.success) {
        Alert.alert('Başarılı', 'Salon başarıyla bağlandı.');
        setSelectedGymForRelationship(null);
        loadClubGyms();
        loadAvailableGyms();
      } else {
        Alert.alert('Hata', response.message || 'Salon bağlanırken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error connecting gym:', error);
      Alert.alert('Hata', 'Salon bağlanırken bir hata oluştu.');
    }
  };

  const handleRemoveGym = async (gymId: string, gymName: string): Promise<void> => {
    Alert.alert(
      'Salonu Kaldır',
      `${gymName} salonunu kulüpten kaldırmak istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await clubService.disconnectGym(clubId, gymId);
              if (response.success) {
                Alert.alert('Başarılı', 'Salon başarıyla kaldırıldı.');
                loadClubGyms();
                loadAvailableGyms();
              } else {
                Alert.alert('Hata', response.message || 'Salon kaldırılırken bir hata oluştu.');
              }
            } catch (error) {
              console.error('Error removing gym:', error);
              Alert.alert('Hata', 'Salon kaldırılırken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  // Merkezi URL servisi kullanılıyor

  const showLogoPickerOptions = (): void => {
    Alert.alert(
      'Logo Seç',
      'Logo yüklemek için bir seçenek seçin',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kameradan Çek', onPress: () => pickLogo('camera') },
        { text: 'Galeriden Seç', onPress: () => pickLogo('library') }
      ]
    );
  };

  const pickLogo = async (source: 'camera' | 'library'): Promise<void> => {
    try {
      let permissionResult;
      
      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Bu özelliği kullanmak için izin vermeniz gerekiyor.');
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // File size check (5MB limit)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Hata', 'Dosya boyutu 5MB\'dan küçük olmalıdır.');
          return;
        }

        // Crop and resize image
        const croppedImage = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setLogoImage(croppedImage.uri);
        uploadLogo(croppedImage.uri);
      }
    } catch (error) {
      console.error('Error picking logo:', error);
      Alert.alert('Hata', 'Logo seçilirken bir hata oluştu.');
    }
  };

  const uploadLogo = async (imageUri: string): Promise<void> => {
    try {
      setLogoUploading(true);
      
      let imageFile;
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        imageFile = new File([blob], 'logo.jpg', { type: 'image/jpeg' });
      } else {
        imageFile = {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'logo.jpg',
        } as any;
      }

      const response = await clubService.uploadClubLogo(clubId, imageFile);
      if (response.success) {
        Alert.alert('Başarılı', 'Logo başarıyla yüklendi.');
      } else {
        Alert.alert('Hata', response.message || 'Logo yüklenirken bir hata oluştu.');
        setLogoImage(null);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      Alert.alert('Hata', 'Logo yüklenirken bir hata oluştu.');
      setLogoImage(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!clubName.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setSaving(true);
      const clubData = {
        name: clubName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        description: description.trim(),
        status
      };

      const response = await clubService.updateClub(clubId, clubData);
      if (response.success) {
        Alert.alert('Başarılı', 'Kulüp bilgileri başarıyla güncellendi.');
        loadClubDetails();
      } else {
        Alert.alert('Hata', response.message || 'Kulüp güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error saving club:', error);
      Alert.alert('Hata', 'Kulüp kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (): void => {
    Alert.alert(
      'Kulübü Sil',
      'Bu kulübü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async (): Promise<void> => {
    try {
      setSaving(true);
      const response = await clubService.deleteClub(clubId);
      if (response.success) {
        Alert.alert('Başarılı', 'Kulüp başarıyla silindi.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', response.message || 'Kulüp silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error deleting club:', error);
      Alert.alert('Hata', 'Kulüp silinirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.leftHeaderSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19L5 12L12 5"
                stroke={colors.text}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kulüp Ayarları</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <TouchableOpacity 
              style={[styles.logoPlaceholder, { backgroundColor: logoImage ? 'transparent' : colors.border }]}
              onPress={showLogoPickerOptions}
              disabled={logoUploading}
            >
              {logoImage ? (
                <Image 
                  source={{ uri: logoImage }} 
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              ) : (
                <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke={colors.textSecondary} strokeWidth="2"/>
                  <Path d="M8 14S9.5 16 12 16S16 14 16 14" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M9 9H9.01" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M15 9H15.01" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              )}
              {logoUploading && (
                <View style={styles.logoLoadingOverlay}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.logoText, { color: colors.textSecondary }]}>
              {logoImage ? 'Logo Değiştir' : 'Logo Yükle'}
            </Text>
          </View>

          {/* İstatistik Kartı */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>İstatistikler</Text>
              <TouchableOpacity style={styles.detailButton}>
                <Text style={styles.detailButtonText}>Detaylı</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsContent}>
               <View style={styles.statsRow}>
                 <View style={styles.statItem}>
                   <Text style={styles.statNumber}>156</Text>
                   <Text style={styles.statLabel}>Üye Sayısı</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statNumber}>142</Text>
                   <Text style={styles.statLabel}>Aktif Üyeler</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statNumber}>89</Text>
                   <Text style={styles.statLabel}>Günlük Giriş</Text>
                 </View>
               </View>
               <View style={styles.statsRow}>
                 <View style={styles.statItem}>
                   <Text style={styles.statNumber}>₺45,250</Text>
                   <Text style={styles.statLabel}>Aylık Kazanç</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statNumber}>₺520,000</Text>
                   <Text style={styles.statLabel}>Yıllık Kazanç</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statNumber}>₺12,800</Text>
                   <Text style={styles.statLabel}>Gider</Text>
                 </View>
               </View>
             </View>
          </View>

          {/* Kulüp Kullanıcıları Kartı */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <Text style={styles.ownerTitle}>Kulüp Kullanıcıları</Text>
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={() => navigation.navigate('ClubUsers', {
                  clubId: club?.id,
                  clubName: club?.name
                })}
              >
                <Text style={styles.detailButtonText}>Tümü</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ownerContent}>
              {ownersLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : clubOwners.length > 0 ? (
                <>
                  <View style={styles.ownerAvatarPlaceholder}>
                    {clubOwners[0].profile_picture && clubOwners[0].profile_picture !== 'default.jpg' ? (
                      <Image 
                        source={{ uri: urlService.getAvatarUrl(clubOwners[0].profile_picture) }}
                        style={styles.ownerAvatarImage}
                      />
                    ) : (
                      <Text style={styles.ownerAvatarText}>
                        {(() => {
                          const firstName = clubOwners[0].first_name || '';
                          const lastName = clubOwners[0].last_name || '';
                          const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
                          return initials || 'S';
                        })()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.ownerInfo}>
                    <Text style={styles.ownerName}>
                      {clubOwners[0].first_name} {clubOwners[0].last_name}
                    </Text>
                    <Text style={styles.ownerUsername}>
                      @{clubOwners[0].user_name}
                    </Text>
                    <Text style={styles.ownerRole}>Kulüp Sahibi</Text>
                    <Text style={styles.ownerEmail}>
                      {clubOwners[0].email}
                    </Text>
                  </View>
                  <View style={styles.ownerActions}>
                    <TouchableOpacity style={styles.contactButton}>
                      <Text style={styles.contactButtonText}>İletişim</Text>
                    </TouchableOpacity>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <Path d="M9 18L15 12L9 6" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                </>
              ) : (
                <View style={styles.noOwnerContainer}>
                  <Text style={[styles.noOwnerText, { color: colors.textSecondary }]}>
                    Henüz atanmamıştır
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Modüller Kartı */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <Text style={styles.ownerTitle}>Modüller</Text>
              <TouchableOpacity 
                style={[styles.addModuleButton, { backgroundColor: colors.primary }]}
                onPress={() => setModulesModalVisible(true)}
              >
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5V19M5 12H19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
            <View style={styles.modulesChipsContainer}>
              {modules.filter(module => module.status).length > 0 ? (
                modules.filter(module => module.status).slice(0, expandedModulesCard ? modules.filter(module => module.status).length : 5).map((module) => (
                  <View key={module.id} style={[styles.moduleChip, { backgroundColor: getModuleColor(module.category) + '20' }]}>
                    <Text style={[styles.moduleChipText, { color: getModuleColor(module.category) }]}>
                      {module.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        const updatedModules = modules.map(m => 
                          m.id === module.id ? { ...m, status: false } : m
                        );
                        setModules(updatedModules);
                      }}
                      style={styles.removeModuleButton}
                    >
                      <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M18 6L6 18M6 6L18 18"
                          stroke={getModuleColor(module.category)}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noModulesText}>Henüz aktif modül bulunmuyor.</Text>
              )}
              {!expandedModulesCard && modules.filter(module => module.status).length > 5 && (
                <TouchableOpacity 
                  style={styles.viewAllModulesButton}
                  onPress={() => setExpandedModulesCard(true)}
                >
                  <Text style={styles.viewAllModulesText}>+{modules.filter(module => module.status).length - 5} daha</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Bayiler Kartı */}
          <View style={styles.dealersCard}>
              <View style={styles.dealersHeader}>
                <Text style={styles.dealersTitle}>Bayiler</Text>
                <View style={styles.dealersButtonGroup}>
                  <TouchableOpacity 
                    style={[styles.detailButton, styles.connectButton]}
                    onPress={() => {
                      setSelectedGymForRelationship(null);
                      setSearchQuery('');
                      setGymsLoaded(false);
                      setAvailableGyms([]);
                      setGymManagementModalVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.detailButtonText, styles.connectButtonText]}>Bağla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.detailButton}
                    onPress={() => navigation.navigate('CreateGymFromClubScreen', { 
                      clubId: clubId,
                      clubName: club?.name || 'Kulüp'
                    })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.detailButtonText}>Oluştur</Text>
                  </TouchableOpacity>
                </View>
              </View>
            <View style={styles.dealersContent}>
              {gymsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
              ) : clubGyms.length > 0 ? (
                clubGyms.map((gym, index) => {
                  const getInitials = (name: string): string => {
                    return name
                      .split(' ')
                      .map(word => word.charAt(0))
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);
                  };

                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'active':
                        return { style: styles.activeBadge, text: 'Aktif', textStyle: styles.activeText };
                      case 'inactive':
                        return { style: styles.inactiveBadge, text: 'Pasif', textStyle: styles.inactiveText };
                      default:
                        return { style: styles.activeBadge, text: 'Aktif', textStyle: styles.activeText };
                    }
                  };

                  const statusInfo = getStatusBadge(gym.status);

                  return (
                    <TouchableOpacity 
                      key={gym.id || index}
                      style={styles.dealerItem}
                      onPress={() => navigation.navigate('GymSettings', { gymId: gym.id })}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dealerLogo}>
                        {gym.logo ? (
                          <Image 
                            source={{ uri: `${getBackendUrl()}/uploads/images/logos/${gym.logo}` }}
                            style={styles.dealerLogoImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.dealerLogoText}>{getInitials(gym.name || 'Salon')}</Text>
                        )}
                      </View>
                      <View style={styles.dealerInfo}>
                        <Text style={styles.dealerName}>{gym.name || 'İsimsiz Salon'}</Text>
                        <Text style={styles.dealerLocation}>{gym.address || 'Adres belirtilmemiş'}</Text>
                      </View>
                      <View style={styles.dealerRight}>
                        <View style={[styles.statusBadge, statusInfo.style]}>
                          <Text style={[styles.statusBadgeText, statusInfo.textStyle]}>{statusInfo.text}</Text>
                        </View>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <Path d="M9 18L15 12L9 6" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Bu kulübe bağlı salon bulunmuyor</Text>
                  <Text style={styles.emptyStateSubText}>Yeni salon oluşturmak için "Oluştur" butonunu kullanın</Text>
                </View>
              )}
            </View>
          </View>

          {/* Kulüp Adı */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kulüp Adı *</Text>
            <TextInput
              style={styles.input}
              value={clubName}
              onChangeText={setClubName}
              placeholder="Kulüp adını giriniz"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Telefon */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefon *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Telefon numarasını giriniz"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          {/* E-posta */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresini giriniz"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Adres */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adres</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Kulüp adresini giriniz"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Açıklama */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Kulüp açıklamasını giriniz"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Durum */}
          <View style={styles.statusContainer}>
            <Text style={styles.label}>Durum</Text>
            <View style={styles.statusToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  status === 'active' && styles.statusOptionActive
                ]}
                onPress={() => setStatus('active')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.statusText,
                  status === 'active' && styles.statusTextActive
                ]}>Aktif</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  status === 'inactive' && styles.statusOptionInactive
                ]}
                onPress={() => setStatus('inactive')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.statusText,
                  status === 'inactive' && styles.statusTextActive
                ]}>Pasif</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sil Butonu */}
          <TouchableOpacity
            style={[styles.deleteButton, saving && styles.disabledButton]}
            onPress={handleDelete}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>Kulübü Sil</Text>
          </TouchableOpacity>
        </View>
       </ScrollView>

      {/* Modüller Modal */}
      <Modal
        visible={modulesModalVisible}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Modül Seç</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModulesModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCloseButtonText, { color: colors.text }]}>×</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={modules}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = item.status;
              return (
                <TouchableOpacity
                  style={[
                    styles.permissionItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isSelected && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => {
                    const updatedModules = modules.map(m => 
                      m.id === item.id ? { ...m, status: !m.status } : m
                    );
                    setModules(updatedModules);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.permissionItemContent}>
                    <Text style={[styles.permissionItemKey, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.permissionItemDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                    <Text style={[styles.permissionItemModule, { color: colors.textSecondary }]}>Kategori: {item.category}</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.permissionSelectedIndicator, { backgroundColor: colors.primary }]}>
                      <Text style={styles.permissionSelectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            style={styles.permissionsList}
          />
        </SafeAreaView>
      </Modal>

      {/* Form Ayarları Modal */}
      <Modal
        visible={formsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFormsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Form Ayarları</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setFormsModalVisible(false)}
              activeOpacity={0.7}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6L18 18" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {forms.map((form, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.permissionItem,
                  form.status && styles.permissionItemSelected
                ]}
                onPress={() => {
                  const updatedForms = [...forms];
                  updatedForms[index].status = !updatedForms[index].status;
                  setForms(updatedForms);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionKey}>{form.name}</Text>
                  <Text style={styles.permissionDescription}>{form.description}</Text>
                </View>
                <View style={[
                  styles.permissionModule,
                  { backgroundColor: getFormColor(form.category) }
                ]}>
                  <Text style={styles.permissionModuleText}>{form.category}</Text>
                </View>
                {form.status && (
                  <View style={styles.permissionSelected}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path d="M20 6L9 17L4 12" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Salon Yönetimi Modal */}
      <Modal
        visible={gymManagementModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setGymManagementModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Salon Yönetimi</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setGymManagementModalVisible(false)}
              activeOpacity={0.7}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6L18 18" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Mevcut Bağlı Salonlar */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Bağlı Salonlar</Text>
              {clubGyms.length > 0 ? (
                clubGyms.map((gym, index) => (
                  <View key={gym.id || index} style={[styles.modalClubCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <View style={styles.modalClubInfo}>
                      <Text style={[styles.modalClubName, { color: colors.text }]}>{gym.name}</Text>
                      <Text style={[styles.modalClubRelation, { color: colors.textSecondary }]}>{gym.address || 'Adres bilgisi yok'}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: colors.error }]}
                      onPress={() => handleRemoveGym(gym.id, gym.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.removeButtonText, { color: colors.white }]}>Kaldır</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyClubText, { color: colors.textSecondary }]}>Bağlı salon bulunmuyor</Text>
              )}
            </View>

            {/* Kullanılabilir Salonlar */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Kullanılabilir Salonlar</Text>
                <TouchableOpacity
                  style={[styles.loadClubsButton, { backgroundColor: colors.secondary }]}
                  onPress={loadAvailableGyms}
                  disabled={gymsLoading}
                  activeOpacity={0.7}
                >
                  {gymsLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={[styles.loadClubsButtonText, { color: colors.text }]}>Salonları Yükle</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {gymsLoaded && (
                <>
                  <TextInput
                    style={[styles.searchInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Salon ara..."
                    placeholderTextColor={colors.textSecondary}
                  />
                  
                  {filteredGyms.length > 0 ? (
                    filteredGyms.map((gym, index) => (
                      <View key={gym.id || index}>
                        <View style={[styles.modalClubCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                          <View style={styles.modalClubInfo}>
                            <Text style={[styles.modalClubName, { color: colors.text }]}>{gym.name}</Text>
                            <Text style={[styles.modalClubRelation, { color: colors.textSecondary }]}>{gym.address || 'Adres bilgisi yok'}</Text>
                          </View>
                          <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                              console.log('Bağla butonuna basıldı:', gym);
                              setSelectedGymForRelationship(selectedGymForRelationship?.id === gym.id ? null : gym);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.addButtonText, { color: colors.white }]}>Bağla</Text>
                          </TouchableOpacity>
                          
                          {/* İlişki türü butonları - kartın içinde, alt kısımda */}
                          {selectedGymForRelationship?.id === gym.id && (
                            <View style={[styles.relationshipSection, { borderColor: colors.border }]}>
                              <Text style={[styles.relationshipTitle, { color: colors.textSecondary }]}>İlişki Türü Seçin:</Text>
                              <View style={styles.relationshipButtons}>
                                <TouchableOpacity
                                  style={[styles.relationshipButton, { backgroundColor: colors.success }]}
                                  onPress={() => {
                                    console.log('Sahiplik seçeneği seçildi');
                                    handleConnectWithRelationship('ownership');
                                  }}
                                >
                                  <Text style={[styles.relationshipButtonText, { color: colors.white }]}>Sahiplik</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  style={[styles.relationshipButton, { backgroundColor: colors.warning }]}
                                  onPress={() => {
                                    console.log('Franchise seçeneği seçildi');
                                    handleConnectWithRelationship('franchise');
                                  }}
                                >
                                  <Text style={[styles.relationshipButtonText, { color: colors.white }]}>Franchise</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  style={[styles.relationshipButton, { backgroundColor: colors.secondary }]}
                                  onPress={() => {
                                    console.log('Ortaklık seçeneği seçildi');
                                    handleConnectWithRelationship('partnership');
                                  }}
                                >
                                  <Text style={[styles.relationshipButtonText, { color: colors.white }]}>Ortaklık</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  ) : gymsLoaded ? (
                    <Text style={[styles.emptyClubText, { color: colors.textSecondary }]}>Bağlanabilir salon bulunamadı</Text>
                  ) : null}
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ClubSettingsScreen;