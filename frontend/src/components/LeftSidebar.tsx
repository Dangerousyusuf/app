import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONTS } from '../constants';
import { DARK_COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { urlService } from '../config/api';

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = 250;

interface Colors {
  background: string;
  text: string;
  surface: string;
  border: string;
  textSecondary: string;
  primary: string;
  white: string;
  error: string;
}

interface User {
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null;
}

interface MenuItem {
  id: string;
  title: string;
  icon: JSX.Element;
  onPress: () => void;
}

interface LeftSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  navigation: any; // Navigation type from React Navigation
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isVisible, onClose, navigation }) => {
  const { user, logout }: { user: User | null; logout: () => Promise<void> } = useAuth();
  const { colors, theme = 'light' } = useTheme();
  const [slideAnim] = useState<Animated.Value>(new Animated.Value(-SIDEBAR_WIDTH));
  const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/100');
  
  // Merkezi URL servisi kullanılıyor
  
  // Kullanıcı bilgileri değiştiğinde profil resmini güncelle
  useEffect(() => {
    if (user?.profile_picture && user.profile_picture !== 'default.jpg' && user.profile_picture !== null) {
      const imageUrl = urlService.getAvatarUrl(user.profile_picture);
      
      if (imageUrl) {
        setProfileImage(imageUrl);
      } else {
        setProfileImage('https://via.placeholder.com/100');
      }
    } else {
      setProfileImage('https://via.placeholder.com/100');
    }
  }, [user]);

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    overlayBackground: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: SIDEBAR_WIDTH,
      height: '100%',
      backgroundColor: 'transparent',
    },
    blurContainer: {
      flex: 1,
      backgroundColor: (theme === 'dark' || (theme === 'auto' && colors === DARK_COLORS)) ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.9)',
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    userInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 10,
    },
    avatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    avatarText: {
      ...FONTS.headline,
      color: colors.white,
      fontWeight: '600' as const,
    },
    userDetails: {
      flex: 1,
      marginLeft: 15,
    },
    userName: {
      ...FONTS.body,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 2,
    },
    userEmail: {
      ...FONTS.caption,
      color: colors.textSecondary,
    },
    menuContainer: {
      flex: 1,
      paddingVertical: 10,
    },
    menuItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    menuIcon: {
      width: 30,
      alignItems: 'center' as const,
      marginRight: 12,
    },
    menuText: {
      ...FONTS.body,
      color: colors.text,
      fontWeight: '500' as const,
    },
    footer: {
      paddingTop: 5,
      paddingBottom: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButtons: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      paddingHorizontal: 10,
    },
    footerButton: {
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      paddingVertical: 10,
      paddingHorizontal: 15,
      flex: 1,
    },
    footerButtonText: {
      ...FONTS.caption,
      color: colors.text,
      fontWeight: '500' as const,
      marginTop: 5,
      textAlign: 'center' as const,
    },
  });

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      title: 'Ana Sayfa',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M9 22V12H15V22" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        navigation.navigate('Home');
        onClose();
      },
    },
    {
      id: 'qr',
      title: 'QR Kod',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M3 7C3 5.89543 3.89543 5 5 5H7C8.10457 5 9 5.89543 9 7V9C9 10.1046 8.10457 11 7 11H5C3.89543 11 3 10.1046 3 9V7Z" stroke={colors.text} strokeWidth="2"/>
          <Path d="M15 7C15 5.89543 15.8954 5 17 5H19C20.1046 5 21 5.89543 21 7V9C21 10.1046 20.1046 11 19 11H17C15.8954 11 15 10.1046 15 9V7Z" stroke={colors.text} strokeWidth="2"/>
          <Path d="M3 17C3 15.8954 3.89543 15 5 15H7C8.10457 15 9 15.8954 9 17V19C9 20.1046 8.10457 21 7 21H5C3.89543 21 3 20.1046 3 19V17Z" stroke={colors.text} strokeWidth="2"/>
          <Path d="M15 15H21V21H15V15Z" stroke={colors.text} strokeWidth="2"/>
        </Svg>
      ),
      onPress: () => {
        navigation.navigate('QR');
        onClose();
      },
    },
    {
      id: 'profile',
      title: 'Profil',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        navigation.navigate('Profile');
        onClose();
      },
    },
    {
      id: 'store',
      title: 'Mağaza',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M3 7V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M3 7C3 8.06087 3.42143 9.07828 4.17157 9.82843C4.92172 10.5786 5.93913 11 7 11C8.06087 11 9.07828 10.5786 9.82843 9.82843C10.5786 9.07828 11 8.06087 11 7C11 8.06087 11.4214 9.07828 12.1716 9.82843C12.9217 10.5786 13.9391 11 15 11C16.0609 11 17.0783 10.5786 17.8284 9.82843C18.5786 9.07828 19 8.06087 19 7C19 8.06087 19.4214 9.07828 20.1716 9.82843C20.9217 10.5786 21.9391 11 23 11V7" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M5 11V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V11" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M9 15H15" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        // Mağaza sayfasına yönlendirme - şimdilik console.log
        console.log('Mağaza sayfasına yönlendirilecek');
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Ayarlar',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2569 9.77251 19.9859C9.5799 19.7148 9.31074 19.5063 9 19.38C8.69838 19.2469 8.36381 19.2072 8.03941 19.266C7.71502 19.3248 7.41568 19.4795 7.18 19.71L7.12 19.77C6.93425 19.956 6.71368 20.1035 6.47088 20.2041C6.22808 20.3048 5.96783 20.3566 5.705 20.3566C5.44217 20.3566 5.18192 20.3048 4.93912 20.2041C4.69632 20.1035 4.47575 19.956 4.29 19.77C4.10405 19.5843 3.95653 19.3637 3.85588 19.1209C3.75523 18.8781 3.70343 18.6178 3.70343 18.355C3.70343 18.0922 3.75523 17.8319 3.85588 17.5891C3.95653 17.3463 4.10405 17.1257 4.29 16.94L4.35 16.88C4.58054 16.6443 4.73519 16.345 4.794 16.0206C4.85282 15.6962 4.81312 15.3616 4.68 15.06C4.55324 14.7642 4.34276 14.512 4.07447 14.3343C3.80618 14.1566 3.49179 14.0613 3.17 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42099 10.0523 3.742 9.94512 4.01309 9.75251C4.28417 9.5599 4.49268 9.29074 4.62 8.98C4.75312 8.67838 4.79282 8.34381 4.734 8.01941C4.67519 7.69502 4.52054 7.39568 4.29 7.16L4.23 7.1C4.04405 6.91425 3.89653 6.69368 3.79588 6.45088C3.69523 6.20808 3.64343 5.94783 3.64343 5.685C3.64343 5.42217 3.69523 5.16192 3.79588 4.91912C3.89653 4.67632 4.04405 4.45575 4.23 4.27C4.41575 4.08405 4.63632 3.93653 4.87912 3.83588C5.12192 3.73523 5.38217 3.68343 5.645 3.68343C5.90783 3.68343 6.16808 3.73523 6.41088 3.83588C6.65368 3.93653 6.87425 4.08405 7.06 4.27L7.12 4.33C7.35568 4.56054 7.65502 4.71519 7.97941 4.774C8.30381 4.83282 8.63838 4.79312 8.94 4.66H9C9.29577 4.53324 9.54802 4.32276 9.72569 4.05447C9.90337 3.78618 9.99872 3.47179 10 3.15V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        navigation.navigate('Settings');
        onClose();
      },
    },
  ];

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      onClose();
    } catch (error: any) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* Overlay */}
      <TouchableOpacity 
        style={styles.overlayBackground} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={80} tint={(theme === 'dark' || (theme === 'auto' && colors === DARK_COLORS)) ? "dark" : "light"} style={styles.blurContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              {user?.profile_picture && user.profile_picture !== 'default.jpg' && user.profile_picture !== null && profileImage && profileImage.trim() !== '' ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.avatarImage}
                  onError={() => setProfileImage('https://via.placeholder.com/100')}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {user?.first_name} {user?.last_name}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIcon}>
                    {item.icon}
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>

                </TouchableOpacity>
                
                {/* Role Submenu */}

              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => {
                  navigation.navigate('Settings');
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2569 9.77251 19.9859C9.5799 19.7148 9.31074 19.5063 9 19.38C8.69838 19.2469 8.36381 19.2072 8.03941 19.266C7.71502 19.3248 7.41568 19.4795 7.18 19.71L7.12 19.77C6.93425 19.956 6.71368 20.1035 6.47088 20.2041C6.22808 20.3048 5.96783 20.3566 5.705 20.3566C5.44217 20.3566 5.18192 20.3048 4.93912 20.2041C4.69632 20.1035 4.47575 19.956 4.29 19.77C4.10405 19.5843 3.95653 19.3637 3.85588 19.1209C3.75523 18.8781 3.70343 18.6178 3.70343 18.355C3.70343 18.0922 3.75523 17.8319 3.85588 17.5891C3.95653 17.3463 4.10405 17.1257 4.29 16.94L4.35 16.88C4.58054 16.6443 4.73519 16.345 4.794 16.0206C4.85282 15.6962 4.81312 15.3616 4.68 15.06C4.55324 14.7642 4.34276 14.512 4.07447 14.3343C3.80618 14.1566 3.49179 14.0613 3.17 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42099 10.0523 3.742 9.94512 4.01309 9.75251C4.28417 9.5599 4.49268 9.29074 4.62 8.98C4.75312 8.67838 4.79282 8.34381 4.734 8.01941C4.67519 7.69502 4.52054 7.39568 4.29 7.16L4.23 7.1C4.04405 6.91425 3.89653 6.69368 3.79588 6.45088C3.69523 6.20808 3.64343 5.94783 3.64343 5.685C3.64343 5.42217 3.69523 5.16192 3.79588 4.91912C3.89653 4.67632 4.04405 4.45575 4.23 4.27C4.41575 4.08405 4.63632 3.93653 4.87912 3.83588C5.12192 3.73523 5.38217 3.68343 5.645 3.68343C5.90783 3.68343 6.16808 3.73523 6.41088 3.83588C6.65368 3.93653 6.87425 4.08405 7.06 4.27L7.12 4.33C7.35568 4.56054 7.65502 4.71519 7.97941 4.774C8.30381 4.83282 8.63838 4.79312 8.94 4.66H9C9.29577 4.53324 9.54802 4.32276 9.72569 4.05447C9.90337 3.78618 9.99872 3.47179 10 3.15V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={styles.footerButtonText}>Ayarlar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.footerButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={colors.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M16 17L21 12L16 7" stroke={colors.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M21 12H9" stroke={colors.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
                <Text style={[styles.footerButtonText, { color: colors.error }]}>Çıkış</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

export default LeftSidebar;