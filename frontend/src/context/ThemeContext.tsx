import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';
import { useAuth } from './AuthContext';
import settingsService from '../services/settingsService';
import { ThemeContextType, ColorScheme, ThemeMode } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [colors, setColors] = useState<ColorScheme>(LIGHT_COLORS);
  const [forceLight, setForceLight] = useState<boolean>(false);

  // Login/kayıt ekranları için light tema zorla
  const setForceLightMode = (force: boolean): void => {
    setForceLight(force);
  };

  // Tema değişikliği fonksiyonu
  const changeTheme = async (newTheme: ThemeMode): Promise<{ success: boolean; message?: string }> => {
    try {
      let selectedTheme = newTheme;
      
      // Otomatik tema seçilirse sistem ayarlarını kontrol et
      if (newTheme === 'system') {
        const systemTheme = Appearance.getColorScheme();
        selectedTheme = systemTheme === 'dark' ? 'dark' : 'light';
      }
      
      setTheme(newTheme);
      
      // Force light mode varsa light tema kullan
      if (forceLight) {
        setColors(LIGHT_COLORS);
      } else {
        setColors(selectedTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS);
      }
      
      // Kullanıcı bazlı tema tercihini kaydet
      if (user && user.id) {
        await AsyncStorage.setItem(`theme_preference_${user.id}`, newTheme);
        // Backend'e de kaydet
        try {
          await settingsService.updateTheme(newTheme);
        } catch (backendError) {
          console.warn('Backend tema güncellemesi başarısız:', backendError);
          // Backend hatası olsa da local storage'da kayıtlı olduğu için devam et
        }
      } else {
        await AsyncStorage.setItem('theme_preference', newTheme);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Tema değiştirme hatası:', error);
      return { success: false, message: error.message };
    }
  };

  // Kullanıcı değiştiğinde tema yükle
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        let savedTheme;
        
        if (user && user.id) {
          // Önce backend'den kullanıcının tema ayarını al
          if (user.theme_preference) {
            savedTheme = user.theme_preference;
          } else {
            // Backend'de yoksa local storage'dan al
            savedTheme = await AsyncStorage.getItem(`theme_preference_${user.id}`);
          }
        } else {
          // Kullanıcı giriş yapmamışsa genel tema ayarını yükle
          savedTheme = await AsyncStorage.getItem('theme_preference');
        }
        
        if (savedTheme) {
          // changeTheme çağırmadan direkt state'i güncelle (sonsuz döngü önlemek için)
          setTheme(savedTheme);
          let selectedTheme = savedTheme;
          if (savedTheme === 'auto') {
            const systemTheme = Appearance.getColorScheme();
            selectedTheme = systemTheme === 'dark' ? 'dark' : 'light';
          }
          setColors(selectedTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS);
        } else {
          // Varsayılan olarak light tema kullan
          setTheme('light');
          setColors(LIGHT_COLORS);
        }
      } catch (error) {
        console.error('Tema yükleme hatası:', error);
        // Hata durumunda varsayılan light tema kullan
        setTheme('light');
        setColors(LIGHT_COLORS);
      }
    };

    loadUserTheme();
  }, [user]);

  // Sistem tema değişikliklerini dinle (otomatik tema için)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system' && !forceLight) {
        setColors(colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS);
      }
    });

    return () => subscription?.remove();
  }, [theme, forceLight]);

  // Force light mode değiştiğinde renkleri güncelle
  useEffect(() => {
    if (forceLight) {
      setColors(LIGHT_COLORS);
    } else {
      // Mevcut tema ayarına göre renkleri güncelle
      let selectedTheme = theme;
      if (theme === 'system') {
        const systemTheme = Appearance.getColorScheme();
        selectedTheme = systemTheme === 'dark' ? 'dark' : 'light';
      }
      setColors(selectedTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS);
    }
  }, [forceLight, theme]);

  const value = {
    theme,
    colors,
    changeTheme,
    toggleTheme: () => changeTheme(theme === 'dark' ? 'light' : 'dark'),
    isDark: colors === DARK_COLORS,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;