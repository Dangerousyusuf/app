import { Dimensions, Platform } from 'react-native';
import { SizesType, FontsType } from '../types';

const { width, height } = Dimensions.get('window');

export const SIZES: SizesType = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 10, // iOS daha yuvarlak köşeler kullanır
  padding: 16, // iOS daha kompakt boşluklar kullanır
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,
  margin: 16,
  marginSmall: 8,
  marginMedium: 16,
  marginLarge: 24,

  // Font sizes - iOS San Francisco font ölçüleri
  largeTitle: 34, // iOS Large Title
  title1: 28, // iOS Title 1
  title2: 22, // iOS Title 2
  title3: 20, // iOS Title 3
  headline: 17, // iOS Headline
  body: 17, // iOS Body
  callout: 16, // iOS Callout
  subhead: 15, // iOS Subhead
  footnote: 13, // iOS Footnote
  caption1: 12, // iOS Caption 1
  caption2: 11, // iOS Caption 2
  
  // Eski font boyutları (geriye uyumluluk için)
  h1: 28,
  h2: 22,
  h3: 20,
  h4: 17,
  body1: 28,
  body2: 22,
  body3: 17,
  body4: 15,
  body5: 13,

  // App dimensions
  width,
  height,
};

export const FONTS: FontsType = {
  // iOS San Francisco font stilleri
  largeTitle: { 
    fontSize: SIZES.largeTitle, 
    lineHeight: SIZES.largeTitle * 1.2, 
    fontWeight: '700',
    letterSpacing: 0.41
  },
  title1: { 
    fontSize: SIZES.title1, 
    lineHeight: SIZES.title1 * 1.2, 
    fontWeight: '600',
    letterSpacing: 0.34
  },
  title2: { 
    fontSize: SIZES.title2, 
    lineHeight: SIZES.title2 * 1.2, 
    fontWeight: '600',
    letterSpacing: 0.35
  },
  title3: { 
    fontSize: SIZES.title3, 
    lineHeight: SIZES.title3 * 1.2, 
    fontWeight: '600',
    letterSpacing: 0.38
  },
  headline: { 
    fontSize: SIZES.headline, 
    lineHeight: SIZES.headline * 1.2, 
    fontWeight: '600',
    letterSpacing: -0.41
  },
  body: { 
    fontSize: SIZES.body, 
    lineHeight: SIZES.body * 1.2, 
    fontWeight: '400',
    letterSpacing: -0.41
  },
  callout: { 
    fontSize: SIZES.callout, 
    lineHeight: SIZES.callout * 1.2, 
    fontWeight: '400',
    letterSpacing: -0.32
  },
  subhead: { 
    fontSize: SIZES.subhead, 
    lineHeight: SIZES.subhead * 1.2, 
    fontWeight: '400',
    letterSpacing: -0.24
  },
  footnote: { 
    fontSize: SIZES.footnote, 
    lineHeight: SIZES.footnote * 1.2, 
    fontWeight: '400',
    letterSpacing: -0.08
  },
  caption1: { 
    fontSize: SIZES.caption1, 
    lineHeight: SIZES.caption1 * 1.2, 
    fontWeight: '400',
    letterSpacing: 0
  },
  caption2: { 
    fontSize: SIZES.caption2, 
    lineHeight: SIZES.caption2 * 1.2, 
    fontWeight: '400',
    letterSpacing: 0.07
  },
  
  // Eski font stilleri (geriye uyumluluk için)
  h1: { fontSize: SIZES.h1, lineHeight: SIZES.h1 * 1.2, fontWeight: '600' },
  h2: { fontSize: SIZES.h2, lineHeight: SIZES.h2 * 1.2, fontWeight: '600' },
  h3: { fontSize: SIZES.h3, lineHeight: SIZES.h3 * 1.2, fontWeight: '600' },
  h4: { fontSize: SIZES.h4, lineHeight: SIZES.h4 * 1.2, fontWeight: '600' },
  body1: { fontSize: SIZES.body1, lineHeight: SIZES.body1 * 1.2, fontWeight: '400' },
  body2: { fontSize: SIZES.body2, lineHeight: SIZES.body2 * 1.2, fontWeight: '400' },
  body3: { fontSize: SIZES.body3, lineHeight: SIZES.body3 * 1.2, fontWeight: '400' },
  body4: { fontSize: SIZES.body4, lineHeight: SIZES.body4 * 1.2, fontWeight: '400' },
  body5: { fontSize: SIZES.body5, lineHeight: SIZES.body5 * 1.2, fontWeight: '400' },
};

export default SIZES;