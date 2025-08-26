import { ColorScheme } from '../types';

export const LIGHT_COLORS: ColorScheme = {
  // Ana renkler
  primary: '#007AFF', // iOS mavi
  secondary: '#5856D6', // iOS mor
  success: '#34C759', // iOS yeşil
  warning: '#FF9500', // iOS turuncu
  error: '#FF3B30', // iOS kırmızı
  
  // Arka plan ve yüzey renkleri
  background: '#FFFFFF', // Beyaz arka plan
  surface: '#F2F2F7', // iOS açık gri arka plan
  surfaceSecondary: '#E5E5EA', // iOS ikincil yüzey rengi
  primaryLight: '#E3F2FD', // Açık mavi arka plan
  
  // Metin renkleri
  text: '#000000', // Ana metin rengi
  textSecondary: '#8E8E93', // İkincil metin rengi
  textTertiary: '#C7C7CC', // Üçüncül metin rengi
  
  // Kenar ve gölge renkleri
  border: '#D1D1D6', // iOS kenar rengi
  separator: '#C6C6C8', // iOS ayırıcı çizgi rengi
  shadow: 'rgba(0, 0, 0, 0.1)', // Hafif gölge rengi
  
  // Temel renkler
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // iOS sistem renkleri
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
};

export const DARK_COLORS: ColorScheme = {
  // Ana renkler
  primary: '#0A84FF', // iOS koyu mavi
  secondary: '#5E5CE6', // iOS koyu mor
  success: '#30D158', // iOS koyu yeşil
  warning: '#FF9F0A', // iOS koyu turuncu
  error: '#FF453A', // iOS koyu kırmızı
  
  // Arka plan ve yüzey renkleri
  background: '#000000', // Siyah arka plan
  surface: '#1C1C1E', // iOS koyu gri arka plan
  surfaceSecondary: '#2C2C2E', // iOS koyu ikincil yüzey rengi
  primaryLight: '#1E3A8A', // Koyu mavi arka plan
  
  // Metin renkleri
  text: '#FFFFFF', // Beyaz metin rengi
  textSecondary: '#8E8E93', // İkincil metin rengi
  textTertiary: '#48484A', // Üçüncül metin rengi
  
  // Kenar ve gölge renkleri
  border: '#38383A', // iOS koyu kenar rengi
  separator: '#38383A', // iOS koyu ayırıcı çizgi rengi
  shadow: 'rgba(0, 0, 0, 0.3)', // Koyu gölge rengi
  
  // Temel renkler
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // iOS sistem renkleri
  systemGray: '#8E8E93',
  systemGray2: '#636366',
  systemGray3: '#48484A',
  systemGray4: '#3A3A3C',
  systemGray5: '#2C2C2E',
  systemGray6: '#1C1C1E',
};

// Geriye uyumluluk için
export const COLORS: ColorScheme = LIGHT_COLORS;

export default COLORS;