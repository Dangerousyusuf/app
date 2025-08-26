import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { urlService } from '../config/api';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import type { 
  RootStackParamList, 
  TabParamList,
  StackNavigationProps 
} from '../types';

// Screens
import {
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  ProfileScreen,
  QRScreen,
  SettingsScreen,
  UsersListScreen,
  SearchScreen,
  CreateRoleScreen
} from '../screens';
import RolesListScreen from '../screens/roles/RolesListScreen';
import RoleSettingsScreen from '../screens/roles/RoleSettingsScreen';
import ThemeScreen from '../screens/settings/ThemeScreen';
import PermissionsListScreen from '../screens/permissions/PermissionsListScreen';
import CreatePermissionScreen from '../screens/permissions/CreatePermissionScreen';
import PermissionSettingsScreen from '../screens/permissions/PermissionSettingsScreen';
import { UserSettingsScreen } from '../screens/users';
import CreateClubScreen from '../screens/clubs/CreateClubScreen';
import ClubsListScreen from '../screens/clubs/ClubsListScreen';
import ClubSettingsScreen from '../screens/clubs/ClubSettingsScreen';
import ClubUsersScreen from '../screens/clubs/ClubUsersScreen';
import ClubOwnersScreen from '../screens/clubs/ClubOwnersScreen';
import CreateGymScreen from '../screens/gyms/CreateGymScreen';
import { CreateGymFromClubScreen } from '../screens/gyms';
import GymsListScreen from '../screens/gyms/GymsListScreen';
import GymSettingsScreen from '../screens/gyms/GymSettingsScreen';



const Stack = createStackNavigator<RootStackParamList>();

// AppNavigator component
const AppNavigator: React.FC = () => {
  const { colors } = useTheme();
  
  const defaultScreenOptions = {
    headerStyle: {
      backgroundColor: colors.background,
      elevation: 0, // Android gölgeyi kaldır
      shadowOpacity: 0, // iOS gölge opaklığı kaldırıldı
      shadowOffset: { width: 0, height: 0 }, // iOS gölge konumu kaldırıldı
      shadowRadius: 0, // iOS gölge yarıçapı kaldırıldı
      borderBottomWidth: 0, // Alt kenar çizgisi kaldırıldı
      borderBottomColor: colors.separator,
      height: Platform.OS === 'ios' ? 44 : 56, // iOS başlık yüksekliği
    },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      ...FONTS.headline,
      fontWeight: '600',
      color: colors.text,
    },
    headerBackTitleVisible: Platform.OS === 'ios', // iOS'ta geri butonu metni göster
    headerBackTitle: 'Geri', // iOS geri butonu metni
    headerTitleAlign: 'center', // Başlığı ortala
  };

  const { user, loading } = useAuth();

  if (loading) {
    return null; // Loading screen eklenebilir
  }

  return (
    <NavigationContainer>
      {user ? <AppTabs screenOptions={defaultScreenOptions} /> : <AuthStack screenOptions={defaultScreenOptions} />}
    </NavigationContainer>
  );
};

// Kimlik doğrulama yapılmamış kullanıcılar için stack
interface AuthStackProps {
  screenOptions: any;
}

const AuthStack: React.FC<AuthStackProps> = ({ screenOptions }) => (
  <Stack.Navigator id={undefined} screenOptions={screenOptions}>
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{ 
        title: 'Kayıt Ol',
      }}
    />
  </Stack.Navigator>
);

const Tab = createBottomTabNavigator<TabParamList>();

// Custom tab bar component with blur effect
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [profileImageKey, setProfileImageKey] = useState<number>(0);
  
  // Merkezi URL servisi kullanılıyor
  
  // User profil resmi değiştiğinde component'ı yeniden render et
  useEffect(() => {
    setProfileImageKey(prev => prev + 1);
  }, [user]);
  
  // Kullanıcının cinsiyetine göre renk belirleme
  const getGenderColor = (): string => {
    if (user?.gender === 'male') {
      return '#64B5F6'; // Açık mavi
    }
    return '#F48FB1'; // Açık pembe (varsayılan)
  };
  
  // Profil resmi var mı kontrol et (default.jpg değilse ve null değilse)
  const hasProfilePicture = user?.profile_picture && user.profile_picture !== 'default.jpg' && user.profile_picture !== null;
  
  const getTabIcon = (routeName: string, isFocused: boolean): React.ReactElement => {
    const iconColor = isFocused ? colors.text : colors.systemGray2;
    
    const IconContainer = ({ children }) => (
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0,
        shadowRadius: 8,
        elevation: 0,
      }}>
        {children}
      </View>
    );
    
    switch (routeName) {
       case 'Home':
         return (
           <IconContainer>
             <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <Path d="M9 22V12H15V22" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </Svg>
           </IconContainer>
         );
       case 'QR':
         return (
           <IconContainer>
             <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <Path d="M3 7C3 5.89543 3.89543 5 5 5H7C8.10457 5 9 5.89543 9 7V9C9 10.1046 8.10457 11 7 11H5C3.89543 11 3 10.1046 3 9V7Z" stroke={iconColor} strokeWidth="2"/>
               <Path d="M15 7C15 5.89543 15.8954 5 17 5H19C20.1046 5 21 5.89543 21 7V9C21 10.1046 20.1046 11 19 11H17C15.8954 11 15 10.1046 15 9V7Z" stroke={iconColor} strokeWidth="2"/>
               <Path d="M3 17C3 15.8954 3.89543 15 5 15H7C8.10457 15 9 15.8954 9 17V19C9 20.1046 8.10457 21 7 21H5C3.89543 21 3 20.1046 3 19V17Z" stroke={iconColor} strokeWidth="2"/>
               <Path d="M15 15H21V21H15V15Z" stroke={iconColor} strokeWidth="2"/>
               <Path d="M12 3V9" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
               <Path d="M12 15V21" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
               <Path d="M3 12H9" stroke={iconColor} strokeWidth="2" strokeLinecap="round"/>
             </Svg>
           </IconContainer>
         );
       case 'Search':
         return (
           <IconContainer>
             <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <Circle cx="11" cy="11" r="8" stroke={iconColor} strokeWidth="2"/>
               <Path d="M21 21L16.65 16.65" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </Svg>
           </IconContainer>
         );
       case 'Profile':
         return (
           <IconContainer>
             {hasProfilePicture ? (
                (() => {
                  const imageUri = urlService.getImageUrlWithTimestamp(`avatars/${user.profile_picture}`);
                  return (imageUri && imageUri.trim() !== '') ? (
                    <Image 
                      key={profileImageKey}
                      source={{ uri: imageUri }} 
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                      }}
                      onError={() => {
                        console.log('Profil resmi yüklenemedi, varsayılan resim kullanılıyor');
                      }}
                    />
                  ) : (
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.systemGray5,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                          fill={iconColor}
                        />
                      </Svg>
                    </View>
                  );
                })()
             ) : (
               <View style={{
                 width: 40,
                 height: 40,
                 borderRadius: 20,
                 backgroundColor: colors.systemGray5,
                 justifyContent: 'center',
                 alignItems: 'center'
               }}>
                 <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                   <Path
                     d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                     fill={iconColor}
                   />
                 </Svg>
               </View>
             )}
           </IconContainer>
         );
       default:
         return (
           <IconContainer>
             <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
               <Circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2"/>
             </Svg>
           </IconContainer>
         );
     }
  };
  
  return (
    <BlurView intensity={40} tint="light" style={{
      position: 'absolute',
      bottom: 10,
      left: 50,
       right: 50,
      height: 70,
      backgroundColor: 'rgba(255, 252, 252, 0.34)',
      borderRadius: 35,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      overflow: 'hidden',
    }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        return (
           <TouchableOpacity
             key={route.key}
             style={{
               flex: 1,
               alignItems: 'center',
               justifyContent: 'center',
             }}
             onPress={onPress}
             activeOpacity={0.7}
           >
             {getTabIcon(route.name, isFocused)}
           </TouchableOpacity>
         );
      })}
    </BlurView>
  );
};

// Kimlik doğrulaması yapılmış kullanıcılar için tab navigator
const MainTabs = () => {
  const { colors } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
  const navigation = useNavigation();

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const toggleRightSidebar = () => {
    setRightSidebarVisible(!rightSidebarVisible);
  };

  const closeRightSidebar = () => {
    setRightSidebarVisible(false);
  };

  const HamburgerButton = ({ onPress }) => {
    const insets = useSafeAreaInsets();
    
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
           marginLeft: 15,
           marginTop: insets.top + 10,
           width: 60,
           height: 60,
           borderRadius: 30,
           backgroundColor: 'rgba(255, 255, 255, 0.3)',
           justifyContent: 'center',
           alignItems: 'center',
           shadowColor: 'transparent',
           shadowOffset: { width: 0, height: 4 },
           shadowOpacity: 0,
           shadowRadius: 8,
           elevation: 0,
         }}
        activeOpacity={0.7}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M3 12H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M3 6H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M3 18H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </TouchableOpacity>
    );
  };

  const RightMenuButton = ({ onPress }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
           position: 'absolute',
           right: 20,
           top: '50%',
           marginTop: -30,
           width: 60,
           height: 60,
           borderRadius: 30,
           backgroundColor: 'rgba(255, 255, 255, 0.3)',
           justifyContent: 'center',
           alignItems: 'center',
           shadowColor: 'transparent',
           shadowOffset: { width: 0, height: 4 },
           shadowOpacity: 0,
           shadowRadius: 8,
           elevation: 0,
           zIndex: 1000,
         }}
        activeOpacity={0.7}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M12 3V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M6 9L12 3L18 9" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M6 15L12 21L18 15" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        id={undefined}
        tabBar={(props) => <CustomTabBar {...props} />}
        safeAreaInsets={{ bottom: 0 }}
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 0,
            borderBottomWidth: 0,
            height: Platform.OS === 'ios' ? 44 : 56,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            ...FONTS.headline,
            fontWeight: '600',
            color: colors.text,
          },
          headerTitleAlign: 'center',
          headerLeft: () => <HamburgerButton onPress={toggleSidebar} />,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Ana Sayfa',
            tabBarLabel: 'Ana Sayfa',
          }}
        />
        <Tab.Screen 
          name="QR" 
          component={QRScreen}
          options={{ 
            title: 'QR',
            tabBarLabel: 'QR',
          }}
        />
        <Tab.Screen 
          name="Search" 
          component={SearchScreen}
          options={{ 
            title: 'Arama',
            tabBarLabel: 'Arama',
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ 
            title: 'Profil',
            tabBarLabel: 'Profil',
          }}
        />
      </Tab.Navigator>
      
      <RightMenuButton onPress={toggleRightSidebar} />
      
      <LeftSidebar 
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        navigation={navigation}
      />
      
      <RightSidebar 
        isVisible={rightSidebarVisible}
        onClose={closeRightSidebar}
      />
    </View>
  );
};

const AppTabs = ({ screenOptions }) => {
  const navigation = useNavigation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const toggleRightSidebar = () => {
    setRightSidebarVisible(!rightSidebarVisible);
  };

  const closeRightSidebar = () => {
    setRightSidebarVisible(false);
  };

  const HamburgerButton = ({ onPress }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
           marginLeft: 15,
           marginTop: insets.top + 10,
           width: 60,
           height: 60,
           borderRadius: 30,
           backgroundColor: 'rgba(255, 255, 255, 0.3)',
           justifyContent: 'center',
           alignItems: 'center',
           shadowColor: 'transparent',
        }}
        activeOpacity={0.7}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M3 12H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M3 6H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M3 18H21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </TouchableOpacity>
    );
  };

  const RightMenuButton = ({ onPress }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
           marginRight: 15,
           marginTop: insets.top + 10,
           width: 60,
           height: 60,
           borderRadius: 30,
           backgroundColor: 'rgba(255, 255, 255, 0.3)',
           justifyContent: 'center',
           alignItems: 'center',
           shadowColor: 'transparent',
        }}
        activeOpacity={0.7}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path d="M12 3V21" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M6 9L12 3L18 9" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <Path d="M6 15L12 21L18 15" stroke={colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator id={undefined} screenOptions={screenOptions}>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="UsersListScreen" 
          component={UsersListScreen}
          options={({ navigation }) => ({ 
            title: 'Kullanıcı Listesi',
            headerBackTitle: 'Geri',
            headerLeft: () => <HamburgerButton onPress={toggleSidebar} />,
            headerRight: () => <RightMenuButton onPress={toggleRightSidebar} />
          })}
        />
        <Stack.Screen 
          name="CreateRoleScreen" 
          options={{ headerShown: false }}
        >
          {(props) => (
            <CreateRoleScreen 
              {...props} 
              toggleSidebar={toggleSidebar}
              toggleRightSidebar={toggleRightSidebar}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="RolesListScreen" 
          component={RolesListScreen}
          options={({ navigation }) => ({ 
            title: 'Rol Listesi',
            headerBackTitle: 'Geri',
            headerLeft: () => <HamburgerButton onPress={toggleSidebar} />,
            headerRight: () => <RightMenuButton onPress={toggleRightSidebar} />
          })}
        />
        <Stack.Screen 
          name="RoleSettings" 
          component={RoleSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="UserSettings" 
          component={UserSettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PermissionsListScreen" 
          component={PermissionsListScreen}
          options={({ navigation }) => ({ 
            title: 'İzin Listesi',
            headerBackTitle: 'Geri',
            headerLeft: () => <HamburgerButton onPress={toggleSidebar} />,
            headerRight: () => <RightMenuButton onPress={toggleRightSidebar} />
          })}
        />
        <Stack.Screen 
          name="CreatePermissionScreen" 
          options={{ headerShown: false }}
        >
          {(props) => (
            <CreatePermissionScreen 
              {...props} 
              toggleSidebar={toggleSidebar}
              toggleRightSidebar={toggleRightSidebar}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="PermissionSettingsScreen" 
          options={{ headerShown: false }}
        >
          {(props) => (
            <PermissionSettingsScreen 
              {...props} 
              toggleSidebar={toggleSidebar}
              toggleRightSidebar={toggleRightSidebar}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="ThemeScreen" 
          component={ThemeScreen} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CreateClubScreen" 
          options={{ headerShown: false }}
        >
          {(props) => (
            <CreateClubScreen 
              {...props} 
              toggleSidebar={toggleSidebar}
              toggleRightSidebar={toggleRightSidebar}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="ClubsListScreen" 
          component={ClubsListScreen}
          options={({ navigation }) => ({ 
            title: 'Kulüp Listesi',
            headerBackTitle: 'Geri',
            headerLeft: () => <HamburgerButton onPress={toggleSidebar} />,
            headerRight: () => <RightMenuButton onPress={toggleRightSidebar} />
          })}
        />
        <Stack.Screen 
          name="ClubSettingsScreen" 
          component={ClubSettingsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ClubUsers" 
          component={ClubUsersScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="ClubOwners" 
          component={ClubOwnersScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CreateGymScreen" 
          component={CreateGymScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="CreateGymFromClubScreen" 
          component={CreateGymFromClubScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="GymsListScreen" 
          component={GymsListScreen}
          options={({ navigation }) => ({ 
            title: 'Salon Listesi',
            headerBackTitle: 'Geri',
            headerLeft: () => <HamburgerButton onPress={toggleSidebar} />,
            headerRight: () => <RightMenuButton onPress={toggleRightSidebar} />
          })}
        />
        <Stack.Screen 
          name="GymSettings" 
          component={GymSettingsScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
      
      <LeftSidebar 
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        navigation={navigation}
      />
      
      <RightSidebar 
        isVisible={rightSidebarVisible}
        onClose={closeRightSidebar}
      />
    </View>
  );
};

export default AppNavigator;