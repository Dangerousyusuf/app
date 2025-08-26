import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { LIGHT_COLORS, DARK_COLORS } from '../../constants/colors';

interface Props {
  navigation: any;
}

interface Colors {
  background: string;
  text: string;
  surface: string;
  border: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
}

interface ThemeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  colors: Colors;
}

const ThemeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, colors, changeTheme }: { theme: string; colors: Colors; changeTheme: (theme: string) => Promise<void> } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string>(theme);

  // Tema context'inden gelen tema ile local state'i senkronize et
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const themes: ThemeOption[] = [
    {
      id: 'light',
      title: 'Açık Tema',
      description: 'Gündüz kullanımı için ideal',
      icon: 'sunny-outline',
      colors: LIGHT_COLORS,
    },
    {
      id: 'dark',
      title: 'Koyu Tema',
      description: 'Gece kullanımı için ideal',
      icon: 'moon-outline',
      colors: DARK_COLORS,
    },
    {
      id: 'auto',
      title: 'Otomatik',
      description: 'Sistem ayarlarını takip eder',
      icon: 'phone-portrait-outline',
      colors: LIGHT_COLORS, // Şimdilik light colors kullan
    },
  ];

  const handleThemeSelect = async (themeId: string): Promise<void> => {
    try {
      // Tema context'ini kullanarak tema değiştir
      await changeTheme(themeId);
      
      Alert.alert(
        'Başarılı',
        'Tema başarıyla güncellendi',
        [{ text: 'Tamam' }]
      );
    } catch (error: any) {
      console.error('Theme selection error:', error);
      Alert.alert(
        'Hata',
        'Tema güncellenirken bir hata oluştu',
        [{ text: 'Tamam' }]
      );
    }
  };

  const renderThemeOption = (theme: ThemeOption): JSX.Element => (
    <TouchableOpacity
      key={theme.id}
      style={[
        styles.themeOption,
        selectedTheme === theme.id && styles.selectedThemeOption,
      ]}
      onPress={() => handleThemeSelect(theme.id)}
    >
      <View style={styles.themePreview}>
        <View style={[styles.previewHeader, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.previewDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.previewDot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.previewDot, { backgroundColor: theme.colors.primary }]} />
        </View>
        <View style={[styles.previewBody, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.previewLine, { backgroundColor: theme.colors.text, opacity: 0.8 }]} />
          <View style={[styles.previewLine, { backgroundColor: theme.colors.text, opacity: 0.6, width: '70%' }]} />
          <View style={[styles.previewLine, { backgroundColor: theme.colors.text, opacity: 0.4, width: '50%' }]} />
        </View>
      </View>

      <View style={styles.themeInfo}>
        <View style={styles.themeHeader}>
          <Ionicons
            name={theme.icon as any}
            size={24}
            color={selectedTheme === theme.id ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.themeTitle,
            selectedTheme === theme.id && styles.selectedThemeTitle
          ]}>
            {theme.title}
          </Text>
          {selectedTheme === theme.id && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
              style={styles.checkIcon}
            />
          )}
        </View>
        <Text style={styles.themeDescription}>{theme.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(colors);

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
        <Text style={styles.headerTitle}>Tema Seçimi</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
         <View style={styles.content}>
          <Text style={styles.sectionTitle}>Görünüm Teması</Text>
          <Text style={styles.sectionDescription}>
            Uygulamanın görünümünü kişiselleştirin
          </Text>

          <View style={styles.themesContainer}>
            {themes.map(renderThemeOption)}
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Otomatik tema, cihazınızın sistem ayarlarını takip eder
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  themesContainer: {
    gap: 16,
  },
  themeOption: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedThemeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  themePreview: {
    height: 80,
    borderRadius: 12,
    overflow: 'hidden' as const,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewHeader: {
    height: 24,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    gap: 4,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewBody: {
    flex: 1,
    padding: 8,
    gap: 4,
  },
  previewLine: {
    height: 4,
    borderRadius: 2,
  },
  themeInfo: {
    gap: 8,
  },
  themeHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  themeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  selectedThemeTitle: {
    color: colors.primary,
  },
  checkIcon: {
    marginLeft: 'auto' as const,
  },
  themeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 36,
  },
  infoContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 30,
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default ThemeScreen;