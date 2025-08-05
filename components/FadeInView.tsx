import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

export function FadeInView({ 
  children, 
  delay = 0, 
  duration = 300, 
  style 
}: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration })
    );
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// 列表项动画组件
export function AnimatedListItem({ 
  children, 
  index = 0, 
  style 
}: { 
  children: React.ReactNode; 
  index?: number; 
  style?: any; 
}) {
  return (
    <FadeInView delay={index * 100} style={style}>
      {children}
    </FadeInView>
  );
}