import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { urlService } from '../../config/api';
import { FONTS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clubService } from '../../services';

// Type definitions
interface CreateClubScreenProps {
  navigation: any;
  toggleSidebar: () => void;
  toggleRightSidebar: () => void;
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

interface CategoryOption {
  value: string;
  title: string;
  description: string;
}

interface ClubData {
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  status: string;
}

interface CreateClubResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
  };
}

interface UploadLogoResponse {
  success: boolean;
  message?: string;
}

const CreateClubScreen: React.FC<CreateClubScreenProps> = ({ navigation, toggleSidebar, toggleRightSidebar }) => {
  const { colors }: { colors: Colors } = useTheme();
  const insets = useSafeAreaInsets();

  // State variables
  const [clubName, setClubName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [loading, setLoading] = useState<boolean>(false);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState<boolean>(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.surface,
      paddingTop: insets.top,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    bottomHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: FONTS.medium,
      color: colors.text,
      flex: 1,
    },
    sidebarButton: {
      padding: 8,
    },
    rightSidebarButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    formContainer: {
      paddingVertical: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    logoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 14,
      fontFamily: FONTS.regular,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: FONTS.regular,
      color: colors.text,
    },
    textArea: {
      minHeight: 80,
      paddingTop: 12,
    },
    statusContainer: {
      marginBottom: 20,
    },
    statusToggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    statusOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    statusOptionActive: {
      backgroundColor: colors.success,
    },
    statusOptionInactive: {
      backgroundColor: colors.error,
    },
    statusText: {
      fontSize: 16,
      fontFamily: FONTS.medium,
      color: colors.text,
    },
    statusTextActive: {
      color: '#FFFFFF',
    },
    createButton: {
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginBottom: insets.bottom + 16,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: colors.textSecondary,
      opacity: 0.6,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: FONTS.medium,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  const categoryOptions: CategoryOption[] = [
    {
      value: 'sports',
      title: 'Spor',
      description: 'Futbol, basketbol, voleybol ve diğer spor aktiviteleri'
    },
    {
      value: 'academic',
      title: 'Akademik',
      description: 'Bilim, teknoloji, araştırma ve eğitim odaklı kulüpler'
    },
    {
      value: 'arts',
      title: 'Sanat',
      description: 'Müzik, resim, tiyatro ve diğer sanatsal faaliyetler'
    },
    {
      value: 'social',
      title: 'Sosyal',
      description: 'Toplumsal sorumluluk, gönüllülük ve sosyal aktiviteler'
    },
    {
      value: 'hobby',
      title: 'Hobi',
      description: 'Oyun, koleksiyon, el sanatları ve hobi aktiviteleri'
    },
    {
      value: 'professional',
      title: 'Mesleki',
      description: 'Kariyer geliştirme ve mesleki beceri odaklı kulüpler'
    },
  ];

  // Merkezi URL servisi kullanılıyor

  // Logo seçme seçenekleri gösterme
  const showLogoPickerOptions = (): void => {
    if (Platform.OS === 'web') {
      pickLogo();
      return;
    }

    Alert.alert(
      'Logo Seç',
      'Logoyu nereden seçmek istiyorsunuz?',
      [
        { text: 'Kamera', onPress: () => pickLogo('camera') },
        { text: 'Galeri', onPress: () => pickLogo('library') },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  // Logo seçme fonksiyonu
  const pickLogo = async (source: 'camera' | 'library' = 'library'): Promise<void> => {
    try {
      // İzin kontrolü
      if (Platform.OS !== 'web') {
        const { status } = source === 'camera' 
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Logo seçmek için izin vermeniz gerekiyor.');
          return;
        }
      }

      let result: ImagePicker.ImagePickerResult;
      
      if (Platform.OS === 'web') {
        // Web için HTML input kullan
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event: Event) => {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            // Dosya boyutu kontrolü (5MB)
            if (file.size > 5 * 1024 * 1024) {
              Alert.alert('Hata', 'Dosya boyutu 5MB\'dan küçük olmalıdır.');
              return;
            }
            
            // Dosya tipi kontrolü
            if (!file.type.startsWith('image/')) {
              Alert.alert('Hata', 'Lütfen geçerli bir resim dosyası seçin.');
              return;
            }
            
            // Web'de resmi kırp
            const reader = new FileReader();
            reader.onload = async (e: ProgressEvent<FileReader>) => {
              const imageUri = e.target?.result as string;
              const croppedImage = await cropLogoForWeb(imageUri);
              if (croppedImage) {
                // Önizleme için URL oluştur
                const previewUrl = URL.createObjectURL(croppedImage);
                setLogoImage(previewUrl);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      } else {
        // Mobil platformlar için
        const options: ImagePicker.ImagePickerOptions = {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1], // Kare kırpma
          quality: 0.8,
        };

        if (source === 'camera') {
          result = await ImagePicker.launchCameraAsync(options);
        } else {
          result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (!result.canceled && result.assets && result.assets[0]) {
          const imageUri = result.assets[0].uri;
          
          // Resmi kare şeklinde kırp
          const croppedImage = await cropLogo(imageUri);
          if (croppedImage) {
            setLogoImage(croppedImage);
          }
        }
      }
    } catch (error) {
      console.error('Logo seçme hatası:', error);
      Alert.alert('Hata', 'Logo seçilirken bir hata oluştu.');
    }
  };

  // Logo kırpma fonksiyonu - Web için
  const cropLogoForWeb = async (imageDataUrl: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        if (!ctx) {
          resolve(null);
          return;
        }
        
        const size = Math.min(img.width, img.height);
        canvas.width = 300;
        canvas.height = 300;
        
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 300, 300);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = imageDataUrl;
    });
  };

  // Logo kırpma fonksiyonu - Mobil için
  const cropLogo = async (uri: string): Promise<string | null> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 300, height: 300 } }
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Logo kırpma hatası:', error);
      return null;
    }
  };

  const handleCreateClub = async (): Promise<void> => {
    if (!clubName.trim()) {
      Alert.alert('Hata', 'Kulüp adı gereklidir.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Hata', 'Telefon numarası gereklidir.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresi gereklidir.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Hata', 'Adres gereklidir.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Hata', 'Açıklama gereklidir.');
      return;
    }

    try {
      setLoading(true);
      
      const clubData: ClubData = {
        name: clubName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        description: description.trim(),
        status: status
      };

      const response = await clubService.createClub(clubData) as CreateClubResponse;
      
      if (response.success) {
        // Kulüp başarıyla oluşturulduysa ve logo seçildiyse logoyu yükle
        if (logoImage && response.data && response.data.id) {
          await uploadClubLogo(response.data.id);
        }
        
        Alert.alert('Başarılı', response.message || 'Kulüp başarıyla oluşturuldu!', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', response.message || 'Kulüp oluşturulurken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('Create club error:', error);
      Alert.alert('Hata', error.message || 'Kulüp oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Logo yükleme fonksiyonu
  const uploadClubLogo = async (clubId: string): Promise<void> => {
    try {
      setLogoUploading(true);
      let logoFile: Blob | { uri: string; type: string; name: string };
      
      if (Platform.OS === 'web') {
        // Web için blob'u file'a çevir
        const response = await fetch(logoImage!);
        logoFile = await response.blob();
      } else {
        // Mobil için URI'yi file'a çevir
        logoFile = {
          uri: logoImage!,
          type: 'image/jpeg',
          name: 'logo.jpg',
        };
      }

      const uploadResponse = await clubService.uploadClubLogo(clubId, logoFile) as UploadLogoResponse;
      
      if (!uploadResponse.success) {
        console.warn('Logo yükleme başarısız:', uploadResponse.message);
      }
    } catch (error) {
      console.error('Logo yükleme hatası:', error);
    } finally {
      setLogoUploading(false);
    }
  };

  const isFormValid = (): boolean => {
    return (
      clubName.trim() !== '' &&
      phone.trim() !== '' &&
      email.trim() !== '' &&
      address.trim() !== '' &&
      description.trim() !== ''
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
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
        
        <View style={styles.bottomHeaderRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M12 19L5 12L12 5" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kulüp Oluştur</Text>
        </View>
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
            <Text style={styles.label}>Adres *</Text>
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
            <Text style={styles.label}>Açıklama *</Text>
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
        </View>
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          (!isFormValid() || loading) && styles.disabledButton
        ]}
        onPress={handleCreateClub}
        disabled={!isFormValid() || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={[styles.createButtonText, { marginLeft: 8 }]}>Oluşturuluyor...</Text>
          </View>
        ) : (
          <Text style={styles.createButtonText}>Kulüp Oluştur</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CreateClubScreen;
export type { CreateClubScreenProps, ClubData, CreateClubResponse, UploadLogoResponse };