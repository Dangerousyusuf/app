import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { SIZES, FONTS } from '../constants';
import { useTheme } from '../context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const getButtonStyle = (): (ViewStyle | undefined)[] => {
    const baseStyle = {
      borderRadius: SIZES.radius,
      alignItems: 'center' as 'center',
      justifyContent: 'center' as 'center',
      paddingHorizontal: SIZES.padding,
      // iOS tarzı gölge efekti
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: disabled ? 0 : 0.1,
      shadowRadius: 4,
      elevation: Platform.OS === 'android' ? (disabled ? 0 : 3) : 0,
    };

    // Size variations
    const sizeStyles = {
      small: {
        paddingVertical: SIZES.paddingSmall,
        minHeight: 36,
      },
      medium: {
        paddingVertical: SIZES.paddingMedium / 2,
        minHeight: 44, // iOS standart buton yüksekliği
      },
      large: {
        paddingVertical: SIZES.paddingMedium,
        minHeight: 50,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? colors.systemGray4 : colors.primary,
      },
      secondary: {
        backgroundColor: disabled ? colors.systemGray4 : colors.secondary,
      },
      outline: {
        backgroundColor: colors.transparent,
        borderWidth: 1,
        borderColor: disabled ? colors.systemGray3 : colors.primary,
      },
    };

    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      style,
    ];
  };

  const getTextStyle = (): (TextStyle | undefined)[] => {
    const baseTextStyle = {
      fontSize: FONTS.headline.fontSize,
      lineHeight: FONTS.headline.lineHeight,
      fontWeight: '600' as '600',
      letterSpacing: -0.41, // iOS buton metin aralığı
    };

    const variantTextStyles = {
      primary: {
        color: colors.white,
      },
      secondary: {
        color: colors.white,
      },
      outline: {
        color: disabled ? colors.systemGray3 : colors.primary,
      },
    };

    return [
      baseTextStyle,
      variantTextStyles[variant],
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6} // iOS daha belirgin dokunma efekti
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;