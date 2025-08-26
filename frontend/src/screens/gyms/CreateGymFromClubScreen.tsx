import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { gymsService } from '../../services';

// Type definitions
interface CreateGymFromClubScreenProps {
  navigation: any;
  route: {
    params?: {
      clubId?: string;
      clubName?: string;
    };
  };
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

interface FormData {
  name: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  timezone: string;
  isPublic: boolean;
  status: string;
  clubId: string | null;
  clubName: string;
}

const CreateGymFromClubScreen: React.FC<CreateGymFromClubScreenProps> = ({ navigation, route }) => {
  const { colors }: { colors: Colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  
  // Get club info from route params if coming from club settings
  const { clubId, clubName } = route.params || {};
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    timezone: 'Europe/Istanbul',
    isPublic: true,
    status: 'active',
    clubId: clubId || null,
    clubName: clubName || ''
  });

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
        club_id: clubId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || null,
        description: formData.description || null,
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
          'Spor salonu başarıyla oluşturuldu ve kulübe bağlandı.',
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
    clubInfo: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    clubInfoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    clubInfoText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    textArea: {
      height: 100,
      paddingTop: 12,
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
        {clubName && (
          <View style={styles.clubInfo}>
            <Text style={styles.clubInfoTitle}>Bağlı Kulüp</Text>
            <Text style={styles.clubInfoText}>{clubName}</Text>
          </View>
        )}

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Spor salonu hakkında açıklama girin"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
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
    </SafeAreaView>
  );
};

export default CreateGymFromClubScreen;
export type { CreateGymFromClubScreenProps, FormData };