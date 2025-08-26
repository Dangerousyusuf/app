import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONTS } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

interface Colors {
  background: string;
  surface: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  card: string;
  notification: string;
}

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface RightSidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = 80;

const RightSidebar: React.FC<RightSidebarProps> = ({ isVisible, onClose }) => {
  const { colors } = useTheme();
  const [slideAnim] = useState(new Animated.Value(SIDEBAR_WIDTH));
  const [submenuAnim] = useState(new Animated.Value(0));
  const [permissionSubmenuAnim] = useState(new Animated.Value(0));
  const [userSubmenuAnim] = useState(new Animated.Value(0));
  const [clubSubmenuAnim] = useState(new Animated.Value(0));
  const [gymSubmenuAnim] = useState(new Animated.Value(0));
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isPermissionMenuOpen, setIsPermissionMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isClubMenuOpen, setIsClubMenuOpen] = useState(false);
  const [isGymMenuOpen, setIsGymMenuOpen] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

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
      top: Platform.OS === 'ios' ? 120 : 100,
      right: 15,
      width: SIDEBAR_WIDTH,
      backgroundColor: 'transparent',
    },
    blurContainer: {
      backgroundColor: 'rgba(255, 252, 252, 0.34)',
      borderRadius: 35,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      overflow: 'hidden',
      maxHeight: 550,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    lastNavItem: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0,
      shadowRadius: 8,
      elevation: 0,
    },
    navText: {
      ...FONTS.caption,
      color: colors.text,
      fontWeight: '500',
      textAlign: 'center',
      fontSize: 10,
    },
    submenuContainer: {
      marginLeft: 20,
      marginTop: 1,
      width: 150,
      backgroundColor: 'transparent',
    },
    submenuContainer: {
      marginLeft: 20,
      marginTop: 1,
      width: 150,
      backgroundColor: 'transparent',
    },
    submenuSidebar: {
      position: 'absolute',
      right: 85,
      width: 150,
      backgroundColor: 'transparent',
      zIndex: 1001,
    },
    userSubmenuSidebar: {
      position: 'absolute',
      right: 85,
      width: 150,
      backgroundColor: 'transparent',
      zIndex: 1001,
    },
    clubSubmenuSidebar: {
      position: 'absolute',
      right: 85,
      width: 150,
      backgroundColor: 'transparent',
      zIndex: 1001,
    },
    gymSubmenuSidebar: {
      position: 'absolute',
      right: 85,
      width: 150,
      backgroundColor: 'transparent',
      zIndex: 1001,
    },
    permissionSubmenuSidebar: {
      position: 'absolute',
      right: 85,
      width: 150,
      backgroundColor: 'transparent',
      zIndex: 1001,
    },
    submenuBlurContainer: {
      backgroundColor: 'rgba(255, 252, 252, 0.34)',
      borderRadius: 20,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: -5, height: 15 },
      shadowOpacity: 0.2,
      shadowRadius: 25,
      elevation: 15,
      overflow: 'hidden',
    },
    submenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    lastSubmenuItem: {
      borderBottomWidth: 0,
    },
    submenuIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    submenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    lastSubmenuItem: {
      borderBottomWidth: 0,
    },
    submenuText: {
      ...FONTS.caption,
      color: colors.text,
      fontWeight: '500',
      fontSize: 12,
      flex: 1,
    },
  });
  
  const navigation = useNavigation();

  const toggleRoleMenu = () => {
    const newValue = !isRoleMenuOpen;
    
    // Diğer menüleri kapat
    if (isPermissionMenuOpen) {
      setIsPermissionMenuOpen(false);
      Animated.timing(permissionSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
      Animated.timing(userSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isClubMenuOpen) {
      setIsClubMenuOpen(false);
      Animated.timing(clubSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isGymMenuOpen) {
      setIsGymMenuOpen(false);
      Animated.timing(gymSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    
    setIsRoleMenuOpen(newValue);
    Animated.timing(submenuAnim, {
      toValue: newValue ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const togglePermissionMenu = () => {
    const newValue = !isPermissionMenuOpen;
    
    // Diğer menüleri kapat
    if (isRoleMenuOpen) {
      setIsRoleMenuOpen(false);
      Animated.timing(submenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
      Animated.timing(userSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isClubMenuOpen) {
      setIsClubMenuOpen(false);
      Animated.timing(clubSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isGymMenuOpen) {
      setIsGymMenuOpen(false);
      Animated.timing(gymSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    
    setIsPermissionMenuOpen(newValue);
    Animated.timing(permissionSubmenuAnim, {
      toValue: newValue ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const toggleUserMenu = () => {
    const newValue = !isUserMenuOpen;
    
    // Diğer menüleri kapat
    if (isRoleMenuOpen) {
      setIsRoleMenuOpen(false);
      Animated.timing(submenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isPermissionMenuOpen) {
      setIsPermissionMenuOpen(false);
      Animated.timing(permissionSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isClubMenuOpen) {
      setIsClubMenuOpen(false);
      Animated.timing(clubSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isGymMenuOpen) {
      setIsGymMenuOpen(false);
      Animated.timing(gymSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    
    setIsUserMenuOpen(newValue);
    Animated.timing(userSubmenuAnim, {
      toValue: newValue ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const toggleClubMenu = () => {
    const newValue = !isClubMenuOpen;
    
    // Diğer menüleri kapat
    if (isRoleMenuOpen) {
      setIsRoleMenuOpen(false);
      Animated.timing(submenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isPermissionMenuOpen) {
      setIsPermissionMenuOpen(false);
      Animated.timing(permissionSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
      Animated.timing(userSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isGymMenuOpen) {
      setIsGymMenuOpen(false);
      Animated.timing(gymSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    
    setIsClubMenuOpen(newValue);
    Animated.timing(clubSubmenuAnim, {
      toValue: newValue ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const toggleGymMenu = () => {
    const newValue = !isGymMenuOpen;
    
    // Diğer menüleri kapat
    if (isRoleMenuOpen) {
      setIsRoleMenuOpen(false);
      Animated.timing(submenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isPermissionMenuOpen) {
      setIsPermissionMenuOpen(false);
      Animated.timing(permissionSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
      Animated.timing(userSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    if (isClubMenuOpen) {
      setIsClubMenuOpen(false);
      Animated.timing(clubSubmenuAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    
    setIsGymMenuOpen(newValue);
    Animated.timing(gymSubmenuAnim, {
      toValue: newValue ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const navigationItems: NavigationItem[] = [
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
        navigation.navigate('Home' as never);
        onClose();
      },
    },
    {
      id: 'clubs',
      title: 'Kulüpler',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" stroke={colors.text} strokeWidth="2" fill={colors.text}/>
          <Path d="M21 9V7L15 6L12 1L9 6L3 7V9H21Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M3 22V9H21V22L18 20L15 22L12 20L9 22L6 20L3 22Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        toggleClubMenu();
      },
    },
    {
      id: 'gyms',
      title: 'Salonlar',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M7.01 14.94L4.64 12.57C4.25 12.18 4.25 11.55 4.64 11.16L7.01 8.79C7.4 8.4 8.03 8.4 8.42 8.79C8.81 9.18 8.81 9.81 8.42 10.2L7.83 10.79H16.17L15.58 10.2C15.19 9.81 15.19 9.18 15.58 8.79C15.97 8.4 16.6 8.4 16.99 8.79L19.36 11.16C19.75 11.55 19.75 12.18 19.36 12.57L16.99 14.94C16.6 15.33 15.97 15.33 15.58 14.94C15.19 14.55 15.19 13.92 15.58 13.53L16.17 12.94H7.83L8.42 13.53C8.81 13.92 8.81 14.55 8.42 14.94C8.03 15.33 7.4 15.33 7.01 14.94Z" stroke={colors.text} strokeWidth="2" fill={colors.text}/>
          <Path d="M2 12H22" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        toggleGymMenu();
      },
    },
    {
      id: 'users',
      title: 'Kullanıcılar',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M15 3.13C15.8604 3.35031 16.623 3.85071 17.1676 4.55232C17.7122 5.25392 18.0078 6.11683 18.0078 7.005C18.0078 7.89318 17.7122 8.75608 17.1676 9.45769C17.623 10.1593 15.8604 10.6597 15 10.88" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        toggleUserMenu();
      },
    },
    {
      id: 'roles',
      title: 'Roller',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        toggleRoleMenu();
      },
    },
    {
      id: 'permissions',
      title: 'İzinler',
      icon: (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M9 12L11 14L15 10" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      ),
      onPress: () => {
        togglePermissionMenu();
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
        navigation.navigate('Settings' as never);
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
        navigation.navigate('Profile' as never);
        onClose();
      },
    },
  ];

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* Overlay */}
      <TouchableOpacity 
        style={styles.overlayBackground} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      {/* Right Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={40} tint="light" style={styles.blurContainer}>
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onScroll={(event) => {
              setScrollOffset(event.nativeEvent.contentOffset.y);
            }}
            scrollEventThrottle={8}
          >
            {navigationItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  index === navigationItems.length - 1 && styles.lastNavItem
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
                <Text style={styles.navText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BlurView>
        
        {/* Roles Sub Menu - Outside ScrollView */}
        {isRoleMenuOpen && (
          <Animated.View style={[
            styles.submenuSidebar,
            {
              top: 430 - scrollOffset, // Roles butonunun pozisyonu - scroll offset
              opacity: submenuAnim,
              transform: [
                {
                  translateX: submenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
                {
                  scale: submenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
            <BlurView intensity={40} tint="light" style={styles.submenuBlurContainer}>
              <TouchableOpacity 
                style={styles.submenuItem}
                onPress={() => {
                  navigation.navigate('RolesListScreen' as never);
                  setIsRoleMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M9 12L11 14L15 10" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Rol Listesi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submenuItem, styles.lastSubmenuItem]}
                onPress={() => {
                  navigation.navigate('CreateRoleScreen' as never);
                  setIsRoleMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 5V19" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M5 12H19" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Rol Oluştur</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        )}
        
        {/* Permissions Sub Menu - Outside ScrollView */}
        {isPermissionMenuOpen && (
          <Animated.View style={[
            styles.permissionSubmenuSidebar,
            {
              top: 540 - scrollOffset, // Permissions butonunun pozisyonu - scroll offset
              opacity: permissionSubmenuAnim,
              transform: [
                {
                  translateX: permissionSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
                {
                  scale: permissionSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
            <BlurView intensity={40} tint="light" style={styles.submenuBlurContainer}>
              <TouchableOpacity 
                style={styles.submenuItem}
                onPress={() => {
                  navigation.navigate('PermissionsListScreen' as never);
                  setIsPermissionMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M9 12L11 14L15 10" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>İzin Listesi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submenuItem, styles.lastSubmenuItem]}
                onPress={() => {
                  navigation.navigate('CreatePermissionScreen' as never);
                  setIsPermissionMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 5V19" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M5 12H19" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>İzin Oluştur</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        )}
        
        {/* Users Sub Menu - Outside ScrollView */}
        {isUserMenuOpen && (
          <Animated.View style={[
            styles.userSubmenuSidebar,
            {
              top: 320 - scrollOffset, // Users butonunun pozisyonu - scroll offset
              opacity: userSubmenuAnim,
              transform: [
                {
                  translateX: userSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
                {
                  scale: userSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
            <BlurView intensity={40} tint="light" style={styles.submenuBlurContainer}>
              <TouchableOpacity 
                style={styles.submenuItem}
                onPress={() => {
                  navigation.navigate('UsersListScreen' as never);
                  setIsUserMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Kullanıcı Listesi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submenuItem, styles.lastSubmenuItem]}
                onPress={() => {
                  console.log('Kullanıcı Oluştur sayfasına git');
                  setIsUserMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M20 8V14" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M23 11H17" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Kullanıcı Oluştur</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        )}
        
        {/* Clubs Sub Menu - Outside ScrollView */}
        {isClubMenuOpen && (
          <Animated.View style={[
            styles.clubSubmenuSidebar,
            {
              top: 100 - scrollOffset, // Kulüpler butonunun pozisyonu - scroll offset
              opacity: clubSubmenuAnim,
              transform: [
                {
                  translateX: clubSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
                {
                  scale: clubSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
            <BlurView intensity={40} tint="light" style={styles.submenuBlurContainer}>
              <TouchableOpacity 
                style={styles.submenuItem}
                onPress={() => {
                  navigation.navigate('ClubsListScreen' as never);
                  setIsClubMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M8 6H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M8 12H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M8 18H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M3 6H3.01" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M3 12H3.01" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M3 18H3.01" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Kulüp Listesi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submenuItem, styles.lastSubmenuItem]}
                onPress={() => {
                  navigation.navigate('CreateClubScreen' as never);
                  setIsClubMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={colors.text} strokeWidth="2"/>
                    <Path d="M12 8V16" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M8 12H16" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Kulüp Oluştur</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        )}
        
        {/* Gyms Sub Menu - Outside ScrollView */}
        {isGymMenuOpen && (
          <Animated.View style={[
            styles.gymSubmenuSidebar,
            {
              top: 210 - scrollOffset, // Salonlar butonunun pozisyonu - scroll offset
              opacity: gymSubmenuAnim,
              transform: [
                {
                  translateX: gymSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
                {
                  scale: gymSubmenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}>
            <BlurView intensity={40} tint="light" style={styles.submenuBlurContainer}>
              <TouchableOpacity 
                style={styles.submenuItem}
                onPress={() => {
                  navigation.navigate('GymsListScreen' as never);
                  setIsGymMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M8 6H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M8 12H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M8 18H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M3 6H3.01" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M3 12H3.01" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M3 18H3.01" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Salon Listesi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submenuItem, styles.lastSubmenuItem]}
                onPress={() => {
                  navigation.navigate('CreateGymScreen' as never);
                  setIsGymMenuOpen(false);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.submenuIconContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={colors.text} strokeWidth="2"/>
                    <Path d="M12 8V16" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M8 12H16" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <Text style={styles.submenuText}>Salon Oluştur</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

export default RightSidebar;