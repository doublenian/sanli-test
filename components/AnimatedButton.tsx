import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useHaptics } from '@/hooks/useHaptics';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  size?: 'small' | 'medium' | 'large';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedButton({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
  hapticType = 'light',
  size = 'medium',
}: AnimatedButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    // 触觉反馈
    switch (hapticType) {
      case 'light':
        haptics.lightImpact();
        break;
      case 'medium':
        haptics.mediumImpact();
        break;
      case 'heavy':
        haptics.heavyImpact();
        break;
      case 'selection':
        haptics.selectionFeedback();
        break;
    }

    // 执行回调
    onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[`${size}Button`],
      styles[`${variant}Button`],
      disabled && styles.disabledButton,
    ];
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [
      styles.buttonText,
      styles[`${size}Text`],
      styles[`${variant}Text`],
      disabled && styles.disabledText,
    ];
    return baseStyle;
  };

  return (
    <AnimatedTouchable
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Size variants
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Color variants
  primaryButton: {
    backgroundColor: '#1E40AF',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryText: {
    color: '#64748B',
  },
  
  successButton: {
    backgroundColor: '#16A34A',
  },
  successText: {
    color: '#FFFFFF',
  },
  
  warningButton: {
    backgroundColor: '#EA580C',
  },
  warningText: {
    color: '#FFFFFF',
  },
  
  dangerButton: {
    backgroundColor: '#DC2626',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  
  disabledButton: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: '#94A3B8',
  },
});