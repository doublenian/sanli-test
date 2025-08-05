import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { useUserSettings } from '@/hooks/useSupabaseData';

export function useSpeech() {
  const { settings } = useUserSettings();
  const isSpeakingRef = useRef(false);

  // 停止当前播报
  const stopSpeaking = async () => {
    if (isSpeakingRef.current) {
      await Speech.stop();
      isSpeakingRef.current = false;
    }
  };

  // 播报文本
  const speak = async (text: string, options?: {
    autoPlay?: boolean;
    rate?: number;
    pitch?: number;
  }) => {
    // 检查语音播报是否启用
    if (!settings?.voice_enabled) {
      return;
    }

    // 如果当前正在播报，先停止
    await stopSpeaking();

    try {
      isSpeakingRef.current = true;
      
      await Speech.speak(text, {
        language: settings?.language === 'english' ? 'en-US' : 'zh-CN',
        rate: options?.rate || 0.75, // 稍慢的语速，适合老年用户
        pitch: options?.pitch || 1.0,
        onStart: () => {
          isSpeakingRef.current = true;
        },
        onDone: () => {
          isSpeakingRef.current = false;
        },
        onStopped: () => {
          isSpeakingRef.current = false;
        },
        onError: () => {
          isSpeakingRef.current = false;
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      isSpeakingRef.current = false;
    }
  };

  // 播报题目（包含题目类型）
  const speakQuestion = async (question: string, type: 'judgment' | 'multiple_choice') => {
    const typeText = type === 'judgment' ? '判断题' : '选择题';
    const fullText = `${typeText}：${question}`;
    await speak(fullText);
  };

  // 播报选项
  const speakOption = async (option: string, index?: number) => {
    const optionText = index !== undefined 
      ? `选项${String.fromCharCode(65 + index)}：${option}`
      : option;
    await speak(optionText);
  };

  // 播报判断题选项
  const speakJudgmentOption = async (isTrue: boolean) => {
    const text = isTrue ? '正确' : '错误';
    await speak(`选择：${text}`);
  };

  // 播报解析
  const speakExplanation = async (explanation: string, isCorrect: boolean) => {
    const resultText = isCorrect ? '回答正确' : '回答错误';
    const fullText = `${resultText}。解析：${explanation}`;
    await speak(fullText);
  };

  // 播报考试或练习状态
  const speakStatus = async (message: string) => {
    await speak(message);
  };

  // 组件卸载时停止播报
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return {
    speak,
    speakQuestion,
    speakOption,
    speakJudgmentOption,
    speakExplanation,
    speakStatus,
    stopSpeaking,
    isSpeaking: isSpeakingRef.current,
  };
}