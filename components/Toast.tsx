import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CircleCheck as CheckCircle, Circle as XCircle, Info } from 'lucide-react-native';
import { useSpeech } from '@/hooks/useSpeech';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onHide: () => void;
  duration?: number;
}

export function Toast({ visible, message, type, onHide, duration = 3000 }: ToastProps) {
  const [opacity] = useState(new Animated.Value(0));
  const speech = useSpeech();

  useEffect(() => {
    if (visible) {
      // 播报Toast消息（重要通知）
      if (type === 'error') {
        speech.speak(`错误：${message}`);
      } else if (type === 'success') {
        speech.speak(`成功：${message}`);
      }
      
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, duration, opacity, onHide]);

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      case 'info':
      default:
        return styles.infoToast;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#16A34A" strokeWidth={2} />;
      case 'error':
        return <XCircle size={20} color="#DC2626" strokeWidth={2} />;
      case 'info':
      default:
        return <Info size={20} color="#1E40AF" strokeWidth={2} />;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.toast, getToastStyle()]}>
        {getIcon()}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: '90%',
  },
  successToast: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  errorToast: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  infoToast: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  message: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
});