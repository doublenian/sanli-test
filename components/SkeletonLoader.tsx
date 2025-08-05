import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: SkeletonLoaderProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 1], [0.3, 0.7]);
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// 预定义的骨架屏组件
export function SkeletonCard() {
  return (
    <View style={styles.cardSkeleton}>
      <SkeletonLoader height={24} width="60%" style={{ marginBottom: 12 }} />
      <SkeletonLoader height={16} width="80%" style={{ marginBottom: 8 }} />
      <SkeletonLoader height={16} width="70%" style={{ marginBottom: 16 }} />
      <SkeletonLoader height={40} width="100%" />
    </View>
  );
}

export function SkeletonList({ itemCount = 3 }: { itemCount?: number }) {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={styles.listItemSkeleton}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.listItemContent}>
            <SkeletonLoader height={16} width="70%" style={{ marginBottom: 8 }} />
            <SkeletonLoader height={14} width="50%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonStats() {
  return (
    <View style={styles.statsSkeleton}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.statItemSkeleton}>
          <SkeletonLoader height={24} width={60} style={{ marginBottom: 8 }} />
          <SkeletonLoader height={14} width={40} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listSkeleton: {
    paddingHorizontal: 20,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  statsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statItemSkeleton: {
    alignItems: 'center',
    flex: 1,
  },
});