import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  navigation: any;
}

interface Colors {
  background: string;
  text: string;
  surface: string;
  border: string;
  textSecondary: string;
}

interface SettingItem {
  id: number;
  title: string;
  icon: string;
  onPress: () => void;
  isLogout?: boolean;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const { colors }: { colors: Colors } = useTheme();

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  const handleThemePress = (): void => {
    navigation.navigate('ThemeScreen');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.text,
    },
    headerRight: {
      alignItems: 'flex-end' as const,
    },
    settingsContainer: {
      marginTop: 20,
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    settingItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingItemLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    settingItemText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 15,
    },
    logoutItem: {
      borderBottomWidth: 0,
    },
    logoutText: {
      color: '#ff4757',
    },
  });

  const settingsItems: SettingItem[] = [
    {
      id: 1,
      title: 'Hesap Ayarları',
      icon: 'person-outline',
      onPress: () => console.log('Hesap Ayarları'),
    },
    {
      id: 2,
      title: 'Tema',
      icon: 'color-palette-outline',
      onPress: handleThemePress,
    },
    {
      id: 3,
      title: 'Bildirimler',
      icon: 'notifications-outline',
      onPress: () => console.log('Bildirimler'),
    },
    {
      id: 4,
      title: 'Gizlilik',
      icon: 'shield-outline',
      onPress: () => console.log('Gizlilik'),
    },
    {
      id: 5,
      title: 'Yardım',
      icon: 'help-circle-outline',
      onPress: () => console.log('Yardım'),
    },
    {
      id: 6,
      title: 'Çıkış Yap',
      icon: 'log-out-outline',
      onPress: handleLogout,
      isLogout: true,
    },
  ];

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
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.settingsContainer}>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingItem,
                item.isLogout && styles.logoutItem,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.isLogout ? '#ff4757' : colors.text}
                />
                <Text
                  style={[
                    styles.settingItemText,
                    item.isLogout && styles.logoutText,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;