import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { urlService } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/authService';
import type { ProfileScreenProps, AuthContextType, ThemeContextType, User } from '../../types';

// Platform-specific imports - expo-image-picker sadece mobil için gerekli
// Web için HTML input kullanacağız

// Platform-specific imports - expo-image-picker sadece mobil için gerekli
// Web için HTML input kullanacağız

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, refreshUser } = useAuth() as AuthContextType;
  const { colors } = useTheme() as ThemeContextType;
  const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/100');
  const [imageKey, setImageKey] = useState<number>(0);
  
  // Merkezi URL servisi kullanılıyor
  
  // Kullanıcı bilgileri değiştiğinde profil resmini güncelle
  useEffect(() => {
    if (user?.profile_picture && user.profile_picture !== 'default.jpg' && user.profile_picture !== null) {
      const backendUrl = urlService.getImageUrl();
      const imageUrl = `${backendUrl}/uploads/images/avatars/${user.profile_picture}`;
      setProfileImage(imageUrl);
    } else {
      setProfileImage('https://via.placeholder.com/100');
    }
    // Image component'ını yeniden render etmek için key'i güncelle
    setImageKey(prev => prev + 1);
  }, [user]);
  
  // Kullanıcının cinsiyetine göre renk belirleme
  const getGenderColor = (): string => {
    if (user?.gender === 'male') {
      return '#64B5F6'; // Açık mavi
    }
    return '#F48FB1'; // Açık pembe (varsayılan)
  };
  
  const genderColor = getGenderColor();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 15,
      backgroundColor: colors.background,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginRight: 10,
      flex: 1,
    },
    settingsButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: 'transparent',
    },
    profileTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 20,
    },
    profileImageBackground: {
      width: 140,
      height: 140,
      borderRadius: 70,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 8,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    checkmarkContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkBorder: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: 'white',
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInfoBlur: {
      position: 'absolute',
      bottom: -10,
      left: 20,
      right: 20,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    profileInfo: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 15,
    },
    userName: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginRight: 10,
    },
    editButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      padding: 5,
    },
    userStatus: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });

  // Resim kırpma fonksiyonu - Web için
  const cropImageForWeb = async (imageDataUrl: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new (window as any).Image();
      
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        canvas.width = 300;
        canvas.height = 300;
        
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        ctx!.drawImage(img, offsetX, offsetY, size, size, 0, 0, 300, 300);
        
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = imageDataUrl;
    });
  };

  // Resim kırpma fonksiyonu - Mobil için
  const cropImage = async (uri: string): Promise<string | null> => {
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
      console.error('Resim kırpma hatası:', error);
      return null;
    }
  };

  // Resim seçme seçenekleri gösterme
  const showImagePickerOptions = (): void => {
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }

    Alert.alert(
      'Profil Resmi Seç',
      'Resmi nereden seçmek istiyorsunuz?',
      [
        { text: 'Kamera', onPress: () => pickImage('camera') },
        { text: 'Galeri', onPress: () => pickImage('library') },
        { text: 'İptal', style: 'cancel' }
      ]
    );
  };

  // Profil resmi seçme fonksiyonu
  const pickImage = async (source: 'library' | 'camera' = 'library'): Promise<void> => {
    try {
      // İzin kontrolü
      if (Platform.OS !== 'web') {
        const { status } = source === 'camera' 
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Resim seçmek için izin vermeniz gerekiyor.');
          return;
        }
      }

      let result;
      
      if (Platform.OS === 'web') {
        // Web için HTML input kullan
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
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
            reader.onload = async (e) => {
              const imageUri = e.target!.result;
              const croppedImage = await cropImageForWeb(imageUri as string);
              if (croppedImage) {
                // Önizleme için URL oluştur
                const previewUrl = URL.createObjectURL(croppedImage);
                setProfileImage(previewUrl);
                await uploadProfileImage(croppedImage);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      } else {
        // Mobil platformlar için
        const options = {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1] as [number, number], // Kare kırpma
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
          const croppedImage = await cropImage(imageUri);
          if (croppedImage) {
            setProfileImage(croppedImage);
            await uploadProfileImage(croppedImage);
          }
        }
      }
    } catch (error) {
      console.error('Resim seçme hatası:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  // Bu fonksiyon artık kullanılmıyor - mobil için expo-image-picker gerekli
  // Şimdilik sadece web destekleniyor

  // Backend'e profil resmi yükleme fonksiyonu
  const uploadProfileImage = async (imageSource: string | Blob | File): Promise<void> => {
    try {
      let response;
      
      if (Platform.OS === 'web') {
        // Web platformu için File objesi kullan
        response = await authService.uploadProfilePicture(imageSource);
      } else {
        // Mobil platformlar için URI kullan
        response = await authService.uploadProfilePicture(imageSource);
      }
      
      if (response.success) {
        Alert.alert('Başarılı', 'Profil resminiz güncellendi.');
        // Kullanıcı bilgilerini yenile
        await refreshUser();
        // Profil resmini güncelle - platform'a göre URL oluştur
        const backendUrl = urlService.getImageUrl();
        const newImageUrl = `${backendUrl}/uploads/images/avatars/${response.data.profile_picture}?t=${Date.now()}`;
        setProfileImage(newImageUrl);
        // Image component'ını yeniden render etmek için key'i güncelle
        setImageKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Profil resmi yükleme hatası:', error);
      Alert.alert('Hata', 'Profil resmi yüklenirken bir hata oluştu.');
      // Hata durumunda eski resmi geri yükle - platform'a göre URL oluştur
      if (user?.profile_picture) {
        const backendUrl = urlService.getImageUrl();
        const fallbackUrl = `${backendUrl}/uploads/images/avatars/${user.profile_picture}`;
        setProfileImage(fallbackUrl);
      } else {
        setProfileImage('https://via.placeholder.com/100');
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            navigation.navigate('Settings');
          }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={showImagePickerOptions}>
          <View style={[
            styles.profileImageBackground, 
            { backgroundColor: (user?.profile_picture && user.profile_picture !== 'default.jpg' && user.profile_picture !== null) ? 'transparent' : genderColor }
          ]}>
            <Image
              key={imageKey}
              source={{
                uri: (profileImage && profileImage.trim() !== '') ? profileImage : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
              }}
              style={styles.profileImage}
              onError={() => {
                console.log('Profil resmi yüklenemedi, varsayılan resim kullanılıyor');
                setProfileImage('https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80');
              }}
            />
          </View>
          <View style={[styles.checkmarkContainer, { backgroundColor: genderColor }]}>
            <View style={styles.checkmarkBorder}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <BlurView intensity={20} tint="light" style={styles.profileInfoBlur}>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.first_name || 'Ad'} {user?.last_name || 'Soyad'}</Text>
            <Text style={styles.userStatus}>{user?.user_name || 'Kullanıcı Adı'}</Text>

            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil-outline" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

    </SafeAreaView>
  );
};



export default ProfileScreen;