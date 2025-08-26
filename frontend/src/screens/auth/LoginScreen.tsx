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
import { SIZES, FONTS } from '../../constants';
import CustomButton from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { LoginScreenProps } from '../../types';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await login({ identifier: username.trim(), password });
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Giriş Hatası',
        error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    Alert.alert('Bilgi', 'Şifre sıfırlama özelliği yakında eklenecek.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo ve Başlık */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Hoş Geldiniz</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Hesabınıza giriş yapın</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={[styles.labelPrimary, { color: colors.text }]}>Kullanıcı Adı</Text>
                <Text style={[styles.labelSecondary, { color: colors.textSecondary }]}> *</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Kullanıcı adınızı girin"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Text style={[styles.labelPrimary, { color: colors.text }]}>Şifre</Text>
                <Text style={[styles.labelSecondary, { color: colors.textSecondary }]}> *</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                     backgroundColor: colors.background,
                     borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Şifrenizi girin"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={navigateToForgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Şifremi Unuttum
              </Text>
            </TouchableOpacity>
          </View>

          {/* Giriş Butonu */}
          <CustomButton
            title={loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          {/* Kayıt Ol Linki */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Hesabınız yok mu?
            </Text>
            <TouchableOpacity style={styles.registerButton} onPress={navigateToRegister}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'center' as 'center',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center' as 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: FONTS.largeTitle.fontSize,
    lineHeight: FONTS.largeTitle.lineHeight,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONTS.callout.fontSize,
    lineHeight: FONTS.callout.lineHeight,
    fontWeight: '400',
    textAlign: 'center' as 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row' as 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: FONTS.subhead.fontSize,
    lineHeight: FONTS.subhead.lineHeight,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelPrimary: {
    fontSize: FONTS.subhead.fontSize,
    lineHeight: FONTS.subhead.lineHeight,
    fontWeight: '600',
  },
  labelSecondary: {
    fontSize: FONTS.subhead.fontSize,
    lineHeight: FONTS.subhead.lineHeight,
    fontWeight: '400',
  },
  input: {
    fontSize: FONTS.body.fontSize,
    lineHeight: FONTS.body.lineHeight,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end' as 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: FONTS.footnote.fontSize,
    lineHeight: FONTS.footnote.lineHeight,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row' as 'row',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: FONTS.body.fontSize,
    lineHeight: FONTS.body.lineHeight,
  },
  registerButton: {
    marginLeft: 5,
  },
  linkText: {
    fontSize: FONTS.body.fontSize,
    lineHeight: FONTS.body.lineHeight,
    fontWeight: '600',
  },
});

export default LoginScreen;