import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SIZES, FONTS } from '../../constants';
import CustomButton from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

interface RegisterData {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  gender: 'male' | 'female';
  tc: string;
  birth_date: string;
  role: string;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Date>(new Date(1999, 5, 17));
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState<boolean>(false);
  const { register } = useAuth();
  const { colors, setForceLightMode } = useTheme();

  // Kayıt ekranında her zaman light tema kullan
  useEffect(() => {
    setForceLightMode(true);
    return () => {
      setForceLightMode(false);
    };
  }, [setForceLightMode]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: SIZES.paddingMedium,
      paddingVertical: SIZES.paddingLarge,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: SIZES.paddingLarge,
    },
    title: {
      ...FONTS.title1,
      color: colors.text,
      marginBottom: SIZES.base,
      textAlign: 'center',
    },
    subtitle: {
      ...FONTS.callout,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      marginBottom: SIZES.paddingMedium,
    },
    inputContainer: {
      marginBottom: SIZES.paddingMedium,
    },
    label: {
      ...FONTS.subhead,
      color: colors.text,
      marginBottom: SIZES.base,
      fontWeight: '500',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.systemGray4,
      borderRadius: SIZES.radius,
      paddingHorizontal: SIZES.paddingMedium,
      paddingVertical: SIZES.paddingSmall + 2,
      fontSize: SIZES.body,
      color: colors.text,
      backgroundColor: colors.white,
      height: 44,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: Platform.OS === 'android' ? 1 : 0,
    },
    helperText: {
      ...FONTS.footnote,
      color: colors.textSecondary,
      marginTop: SIZES.base / 2,
    },
    registerButton: {
      marginTop: SIZES.paddingMedium,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: SIZES.paddingLarge,
    },
    footerText: {
      ...FONTS.subhead,
      color: colors.textSecondary,
      marginRight: 4,
    },
    loginButton: {
      padding: 4,
    },
    linkText: {
      ...FONTS.subhead,
      color: colors.primary,
      fontWeight: '600',
    },
    errorText: {
      color: colors.error,
    },
    datePickerButton: {
      borderWidth: 1,
      borderColor: colors.systemGray4,
      borderRadius: SIZES.radius,
      paddingHorizontal: SIZES.paddingMedium,
      paddingVertical: SIZES.paddingSmall + 2,
      backgroundColor: colors.white,
      height: 44,
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: Platform.OS === 'android' ? 1 : 0,
    },
    datePickerText: {
      fontSize: SIZES.body,
      color: colors.text,
    },
    datePickerButtonContainer: {
      alignItems: 'center',
      marginTop: SIZES.paddingSmall,
    },
    datePickerDoneButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SIZES.paddingLarge,
      paddingVertical: SIZES.paddingSmall,
      borderRadius: SIZES.radius,
      minWidth: 100,
      alignItems: 'center',
    },
    datePickerDoneButtonText: {
      color: colors.white,
      fontSize: SIZES.body,
      fontWeight: '600',
    },
    radioContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SIZES.base,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: SIZES.paddingMedium,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.systemGray3,
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.white,
      borderWidth: 6,
    },
    radioText: {
      ...FONTS.body,
      color: colors.text,
    },
  });

  const handleRegister = async (): Promise<void> => {
    // Form validasyonu
    if (!username || !firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    // Kullanıcı adı validasyonu (Türkçe karakter kontrolü)
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(username)) {
      Alert.alert('Hata', 'Kullanıcı adı sadece İngilizce karakterler, rakamlar, nokta (.), tire (-) ve alt çizgi (_) içerebilir.');
      return;
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir email adresi girin.');
      return;
    }
    
    // Telefon numarası kontrolü
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası girin (10-11 rakam).');
      return;
    }

    // Şifre kontrolü
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    // Şifre eşleşme kontrolü
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    // Doğum tarihi geçerlilik kontrolü
    const today = new Date();
    const minAge = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    const maxAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    
    if (birthDate > today) {
      Alert.alert('Hata', 'Doğum tarihi gelecekte olamaz.');
      return;
    }
    
    if (birthDate < minAge) {
      Alert.alert('Hata', 'Geçerli bir doğum tarihi girin.');
      return;
    }
    
    if (birthDate > maxAge) {
      Alert.alert('Hata', 'En az 13 yaşında olmalısınız.');
      return;
    }

    setLoading(true);

    try {
      // AuthContext'ten register fonksiyonunu kullanma
      const userData: RegisterData = {
        user_name: username,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        password: password,
        gender: gender,
        tc: '00000000000', // Şimdilik boş bir değer gönderiyoruz
        birth_date: birthDate.toISOString().split('T')[0],
        role: 'user' // Varsayılan rol
      };
      
      const response = await register(userData);
      
      if (response && response.success) {
        Alert.alert(
          'Başarılı', 
          'Kayıt işlemi başarıyla tamamlandı. Giriş yapabilirsiniz.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Hata', response?.message || 'Kayıt işlemi sırasında bir sorun oluştu.');
      }
    } catch (error: any) {
      console.error('RegisterScreen - Kayıt hatası:', error);
      
      // Hata detaylarını konsola yazdır
      if (error.response) {
        // Sunucudan gelen hata yanıtı
        console.error('Sunucu yanıtı:', error.response.data);
        console.error('Durum kodu:', error.response.status);
        console.error('Yanıt başlıkları:', error.response.headers);
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error('İstek yapıldı ama yanıt alınamadı:', error.request);
      } else {
        // İstek oluşturulurken bir şeyler yanlış gitti
        console.error('İstek hatası:', error.message);
      }
      
      // Network hatası mı kontrol et
      const isNetworkError = error.message?.includes('Network Error') || 
                            !error.response || 
                            error.code === 'ECONNABORTED';
      
      const errorMessage = isNetworkError
        ? 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.'
        : error.response?.data?.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Başlık */}
            <View style={styles.header}>
              <Text style={styles.title}>Kayıt Ol</Text>
              <Text style={styles.subtitle}>Yeni bir hesap oluşturun</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Kullanıcı Adı</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Kullanıcı Adı"
                  placeholderTextColor={colors.systemGray3}
                  value={username}
                  onChangeText={(text: string) => {
                    setUsername(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={colors.primary}
                />
                {username && !/^[a-zA-Z0-9_.-]+$/.test(username) && (
                  <Text style={[styles.helperText, styles.errorText]}>
                    Sadece İngilizce karakterler, rakamlar, nokta (.), tire (-) ve alt çizgi (_) kullanabilirsiniz
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınızı girin"
                  placeholderTextColor={colors.systemGray3}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCorrect={false}
                  selectionColor={colors.primary}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Soyad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Soyadınızı girin"
                  placeholderTextColor={colors.systemGray3}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCorrect={false}
                  selectionColor={colors.primary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={colors.systemGray3}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={colors.primary}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Telefon Numarası</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5xxxxxxxxx"
                  placeholderTextColor={colors.systemGray3}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={colors.primary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi girin"
                  placeholderTextColor={colors.systemGray3}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={colors.primary}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Şifre Tekrar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor={colors.systemGray3}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={colors.primary}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Doğum Tarihi</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.datePickerText}>
                    {birthDate.toLocaleDateString('tr-TR')}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <View>
                    <DateTimePicker
                      value={birthDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      minimumDate={new Date(1920, 0, 1)}
                      locale="tr-TR"
                    />
                    {Platform.OS === 'ios' && (
                      <View style={styles.datePickerButtonContainer}>
                        <TouchableOpacity
                          style={styles.datePickerDoneButton}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.datePickerDoneButtonText}>Tamam</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cinsiyet</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={styles.radioOption} 
                    onPress={() => setGender('male')}
                  >
                    <View style={[styles.radioButton, gender === 'male' && styles.radioButtonSelected]} />
                    <Text style={styles.radioText}>Erkek</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption} 
                    onPress={() => setGender('female')}
                  >
                    <View style={[styles.radioButton, gender === 'female' && styles.radioButtonSelected]} />
                    <Text style={styles.radioText}>Kadın</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <CustomButton
                title={loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                onPress={handleRegister}
                disabled={loading}
                style={styles.registerButton}
                size="large"
              />
            </View>

            {/* Alt Bilgi */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Zaten bir hesabınız var mı?
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              >
                <Text style={styles.linkText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;