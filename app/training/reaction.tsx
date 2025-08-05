import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Zap, Play, RotateCcw, TriangleAlert as AlertTriangle } from 'lucide-react-native';

import { useTraining } from '@/hooks/useSupabaseData';

export default function ReactionTrainingScreen() {
  const router = useRouter();
  const { trainingData, loading: questionsLoading } = useTraining();
  const [gameState, setGameState] = useState<'intro' | 'ready' | 'waiting' | 'signal' | 'result'>('intro');
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [correctResponses, setCorrectResponses] = useState<boolean[]>([]);
  const [signalStartTime, setSignalStartTime] = useState<number>(0);
  const [countDown, setCountDown] = useState(3);
  const [averageReactionTime, setAverageReactionTime] = useState(0);
  const [reactionTests, setReactionTests] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const currentTest = reactionTests[currentTestIndex];

  useEffect(() => {
    if (trainingData?.reaction) {
      setReactionTests(trainingData.reaction.tests || []);
      setConfig(trainingData.reaction.config || {});
      setCountDown(trainingData.reaction.config?.countdownTime || 3);
    }

  useEffect(() => {
    if (gameState === 'ready' && countDown > 0) {
      const timer = setTimeout(() => setCountDown(countDown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'ready' && countDown === 0) {
      setGameState('waiting');
      // Start waiting for signal
      const delay = currentTest.delay;
      setTimeout(() => {
        setSignalStartTime(Date.now());
        setGameState('signal');
        startPulseAnimation();
      }, delay);
    }
  }, [gameState, countDown]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startGame = () => {
    setGameState('ready');
    setCurrentTestIndex(0);
    setReactionTimes([]);
    setCorrectResponses([]);
    setCountDown(config.countdownTime || 3);
  };

  const handleResponse = (responseType: 'brake' | 'avoid' | 'ignore') => {
    if (gameState !== 'signal') return;

    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    const reactionTime = Date.now() - signalStartTime;
    const isCorrect = responseType === currentTest.type;

    setReactionTimes([...reactionTimes, reactionTime]);
    setCorrectResponses([...correctResponses, isCorrect]);

    // Move to next test or finish
    if (currentTestIndex < reactionTests.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
      setGameState('ready');
      setCountDown(config.countdownTime || 3);
    } else {
      // Calculate results
      const correctReactions = [...correctResponses, isCorrect];
      const times = [...reactionTimes, reactionTime];
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      setAverageReactionTime(avgTime);
      setGameState('result');
    }
  };

  const handleWrongTiming = () => {
    // User responded too early or during waiting
    setReactionTimes([...reactionTimes, 9999]); // Penalty time
    setCorrectResponses([...correctResponses, false]);

    if (currentTestIndex < reactionTests.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
      setGameState('ready');
      setCountDown(config.countdownTime || 3);
    } else {
      const avgTime = Math.round([...reactionTimes, 9999].reduce((a, b) => a + b, 0) / [...reactionTimes, 9999].length);
      setAverageReactionTime(avgTime);
      setGameState('result');
    }
  };

  const getActionTypeConfig = (type: string) => {
    const actionTypes = config.actionTypes || {
      'brake': { color: '#DC2626', label: '制动' },
      'avoid': { color: '#EA580C', label: '避让' },
      'ignore': { color: '#16A34A', label: '正常行驶' }
    };
    return actionTypes[type] || { color: '#64748B', label: type };
  };

  const getInstructionItems = () => [
    {
      type: 'brake',
      description: '红色信号 → 点击"制动"按钮'
    },
    {
      type: 'avoid', 
      description: '橙色信号 → 点击"避让"按钮'
    },
    {
      type: 'ignore',
      description: '绿色信号 → 不需要操作'
    }
  ];

  if (questionsLoading || reactionTests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#1E40AF" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>反应力训练</Text>
          
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载训练题目中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderIntro = () => (
    <View style={styles.contentContainer}>
      <View style={styles.introCard}>
        <Zap size={64} color="#EA580C" strokeWidth={2} />
        <Text style={styles.introTitle}>反应力训练</Text>
        <Text style={styles.introDescription}>
          模拟真实驾驶中的紧急情况，测试并提升您的反应速度。
          根据屏幕提示，做出正确快速的反应。
        </Text>
        
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>操作说明：</Text>
          {getInstructionItems().map((item, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={[styles.colorDot, { backgroundColor: getActionTypeConfig(item.type).color }]} />
              <Text style={styles.instructionText}>{item.description}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={startGame}
          activeOpacity={0.8}
        >
          <Play size={24} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.startButtonText}>开始训练</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReady = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.testCounter}>
          第 {currentTestIndex + 1} 项 / {reactionTests.length}
        </Text>
      </View>

      <View style={styles.readyCard}>
        <Text style={styles.readyTitle}>准备开始</Text>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countDown}</Text>
        </View>
        <Text style={styles.readyInstruction}>
          请保持注意力集中，根据信号快速反应
        </Text>
      </View>
    </View>
  );

  const renderWaiting = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.testCounter}>
          第 {currentTestIndex + 1} 项 / {reactionTests.length}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.waitingArea}
        onPress={handleWrongTiming}
        activeOpacity={1}
      >
        <Text style={styles.waitingText}>等待信号...</Text>
        <Text style={styles.waitingSubtext}>请耐心等待，不要提前操作</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignal = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.testCounter}>
          第 {currentTestIndex + 1} 项 / {reactionTests.length}
        </Text>
      </View>

      <Animated.View style={[
        styles.signalArea,
        { 
          backgroundColor: currentTest.color,
          transform: [{ scale: pulseAnim }]
        }
      ]}>
        <AlertTriangle size={80} color="#FFFFFF" strokeWidth={3} />
        <Text style={styles.signalText}>{currentTest.instruction}</Text>
      </Animated.View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: getActionTypeConfig('brake').color }]}
          onPress={() => handleResponse('brake')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{getActionTypeConfig('brake').label}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: getActionTypeConfig('avoid').color }]}
          onPress={() => handleResponse('avoid')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{getActionTypeConfig('avoid').label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResult = () => {
    const correctCount = correctResponses.filter(Boolean).length;
    const accuracy = Math.round((correctCount / correctResponses.length) * 100);
    const grade = averageReactionTime < 500 ? '优秀' : 
                 averageReactionTime < 800 ? '良好' : 
                 averageReactionTime < 1200 ? '一般' : '需要提高';

    return (
      <View style={styles.contentContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>训练完成</Text>
          
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreText}>{averageReactionTime}</Text>
            <Text style={styles.scoreLabel}>毫秒</Text>
            <Text style={styles.gradeText}>{grade}</Text>
          </View>

          <View style={styles.resultDetails}>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>正确反应：</Text>
              <Text style={[styles.resultDetailValue, { color: '#16A34A' }]}>
                {correctCount} / {correctResponses.length}
              </Text>
            </View>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>准确率：</Text>
              <Text style={[styles.resultDetailValue, { color: '#1E40AF' }]}>
                {accuracy}%
              </Text>
            </View>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>平均反应时间：</Text>
              <Text style={[styles.resultDetailValue, { color: '#EA580C' }]}>
                {averageReactionTime}毫秒
              </Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setGameState('intro')}
              activeOpacity={0.8}
            >
              <RotateCcw size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.retryButtonText}>再试一次</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>返回</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#1E40AF" strokeWidth={2} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>反应力训练</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {gameState === 'intro' && renderIntro()}
      {gameState === 'ready' && renderReady()}
      {gameState === 'waiting' && renderWaiting()}
      {gameState === 'signal' && renderSignal()}
      {gameState === 'result' && renderResult()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSpacer: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 16,
  },
  introDescription: {
    fontSize: 18,
    lineHeight: 26,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#64748B',
  },
  startButton: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  gameHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  testCounter: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  readyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  readyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 32,
  },
  countdownContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1E40AF',
  },
  readyInstruction: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
  },
  waitingArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
  },
  waitingSubtext: {
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
  },
  signalArea: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  signalText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#EA580C',
  },
  scoreLabel: {
    fontSize: 20,
    color: '#64748B',
  },
  gradeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginTop: 8,
  },
  resultDetails: {
    width: '100%',
    marginBottom: 32,
  },
  resultDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultDetailLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  resultDetailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});