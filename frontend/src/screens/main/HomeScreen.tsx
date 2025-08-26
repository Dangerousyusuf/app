import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SIZES, FONTS } from '../../constants';
import CustomButton from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';

type MainStackParamList = {
  Home: undefined;
  QR: undefined;
  Users: undefined;
  Clubs: undefined;
  Gyms: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { colors } = useTheme();
  
  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      
      // Çıkış başarılı - AuthContext user state'ini null yapar ve navigation otomatik olarak AuthStack'e geçer
      // Manual navigation yapmaya gerek yok
    } catch (error) {
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
      console.error('Logout error:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 110, // Yeni floating tab bar için padding
    },
    content: {
      padding: SIZES.padding,
    },
    welcomeSection: {
      alignItems: 'center',
      marginBottom: SIZES.padding * 2,
      paddingVertical: SIZES.padding,
    },
    welcomeTitle: {
      ...FONTS.largeTitle,
      color: colors.text,
      marginBottom: SIZES.base,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      ...FONTS.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: SIZES.padding,
    },
    infoSection: {
      marginBottom: SIZES.padding * 2,
    },
    infoCard: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      marginBottom: SIZES.padding,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    infoTitle: {
      ...FONTS.headline,
      color: colors.text,
      marginBottom: SIZES.base,
    },
    infoText: {
      ...FONTS.subheadline,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    featuresSection: {
      marginBottom: SIZES.padding * 2,
    },
    sectionTitle: {
      ...FONTS.title1,
      color: colors.text,
      marginBottom: SIZES.padding,
    },
    featureList: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: SIZES.radius,
      padding: SIZES.padding,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    featureItem: {
      ...FONTS.body,
      color: colors.text,
      marginBottom: SIZES.base,
      lineHeight: 22,
      paddingVertical: 2,
    },
    logoutSection: {
      alignItems: 'center',
      marginTop: SIZES.padding,
      marginBottom: SIZES.padding,
    },
    logoutButton: {
      minWidth: 250,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hoş Geldiniz Mesajı */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
            <Text style={styles.welcomeSubtitle}>
              Başarıyla giriş yaptınız. Uygulama hazır durumda.
            </Text>
          </View>

          {/* Bilgi Kartları */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Bilgiler</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>React Native</Text>
              <Text style={styles.infoText}>
                Expo ile geliştirilmiş mobil uygulama
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Backend Hazır</Text>
              <Text style={styles.infoText}>
                Node.js + Express + PostgreSQL altyapısı
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Modern UI</Text>
              <Text style={styles.infoText}>
                Apple tasarım sistemine uygun arayüz
              </Text>
            </View>
          </View>

          {/* Özellikler */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Özellikler</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• Responsive tasarım</Text>
              <Text style={styles.featureItem}>• Form validasyonu</Text>
              <Text style={styles.featureItem}>• Navigation sistemi</Text>
              <Text style={styles.featureItem}>• Custom bileşenler</Text>
              <Text style={styles.featureItem}>• Tema sistemi</Text>
              <Text style={styles.featureItem}>• Error handling</Text>
            </View>
          </View>

          {/* Çıkış Butonu */}
          <View style={styles.logoutSection}>
            <CustomButton
              title="Çıkış Yap"
              onPress={handleLogout}
              variant="outline"
              style={styles.logoutButton}
              size="large"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;