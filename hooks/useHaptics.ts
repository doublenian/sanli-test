import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useUserSettings } from '@/hooks/useSupabaseData';

export function useHaptics() {
  const { settings } = useUserSettings();

  // 轻微触觉反馈 - 用于按钮点击
  const lightImpact = () => {
    if (Platform.OS !== 'web' && settings?.haptics_enabled !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // 中等触觉反馈 - 用于重要操作
  const mediumImpact = () => {
    if (Platform.OS !== 'web' && settings?.haptics_enabled !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // 重度触觉反馈 - 用于错误或警告
  const heavyImpact = () => {
    if (Platform.OS !== 'web' && settings?.haptics_enabled !== false) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  // 选择反馈 - 用于选中操作
  const selectionFeedback = () => {
    if (Platform.OS !== 'web' && settings?.haptics_enabled !== false) {
      Haptics.selectionAsync();
    }
  };

  // 通知反馈 - 用于成功/错误/警告状态
  const notificationFeedback = (type: 'success' | 'warning' | 'error') => {
    if (Platform.OS !== 'web' && settings?.haptics_enabled !== false) {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
  };

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionFeedback,
    notificationFeedback,
  };
}