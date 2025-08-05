import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, Play, RotateCcw } from 'lucide-react-native';

import { useTraining } from '@/hooks/useSupabaseData';

export default function JudgmentTrainingScreen() {
  const router = useRouter();
  const { trainingQuestions, loading: questionsLoading } = useTraining();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [trafficScenarios, setTrafficScenarios] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({});

  const currentScenario = trafficScenarios[currentIndex];

  useEffect(() => {
    if (trainingQuestions?.judgment) {
      setTrafficScenarios(trainingQuestions.judgment.scenarios || []);
      setConfig(trainingQuestions.judgment.config || {});
      setTimeLeft(trainingQuestions.judgment.config?.thinkingTime || 60);
    }
  }, [trainingQuestions]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      // Auto advance to next question when time runs out
      handleAnswer(-1); // -1 indicates timeout
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setUserAnswers([]);
    setScore(0);
    setTimeLeft(config.thinkingTime || 60);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    if (answerIndex === currentScenario.correctAnswer) {
      const pointsPerQuestion = config.pointsPerQuestion || 20;
      setScore(score + pointsPerQuestion);
    }

    // Move to next question or finish
    if (currentIndex < trafficScenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(config.thinkingTime || 60);
    } else {
      // Calculate final score
      const finalScore = newAnswers.reduce((acc, answer, index) => {
        if (answer === trafficScenarios[index].correctAnswer) {
          return acc + (config.pointsPerQuestion || 20);
        }
        return acc;
      }, 0);
      setScore(finalScore);
      setGameState('result');
    }
  };

  const renderIntro = () => (
    <View style={styles.contentContainer}>
      <View style={styles.introCard}>
        <Eye size={64} color="#DC2626" strokeWidth={2} />
        <Text style={styles.introTitle}>判断力训练</Text>
        <Text style={styles.introDescription}>
          通过真实的交通场景，提升您的驾驶判断能力。
          仔细观察场景图片，在60秒内选择正确的处理方式。
        </Text>
        
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>训练规则：</Text>
          <Text style={styles.instructionText}>• 场景题目：5个</Text>
          <Text style={styles.instructionText}>• 思考时间：{config.thinkingTime || 60}秒/题</Text>
          <Text style={styles.instructionText}>• 答对得分：{config.pointsPerQuestion || 20}分/题</Text>
          <Text style={styles.instructionText}>• 超时算错：0分</Text>
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

  const renderGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <Text style={styles.questionCounter}>
          第 {currentIndex + 1} 题 / {trafficScenarios.length}
        </Text>
        <View style={styles.timerContainer}>
          <Text style={[
            styles.timerText,
            timeLeft <= 10 && styles.timerWarning
          ]}>
            {timeLeft}秒
          </Text>
        </View>
      </View>

      <View style={styles.scenarioCard}>
        <Text style={styles.scenarioTitle}>{currentScenario.scenario}</Text>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: currentScenario.image }}
            style={styles.scenarioImage}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.questionText}>{currentScenario.question}</Text>

        <View style={styles.optionsContainer}>
          {currentScenario.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(index)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderResult = () => {
    const correctCount = userAnswers.filter((answer, index) => 
      answer === trafficScenarios[index].correctAnswer
    ).length;

    return (
      <View style={styles.contentContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>训练完成</Text>
          
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreText}>{score}</Text>
            <Text style={styles.scoreLabel}>分</Text>
          </View>

          <View style={styles.resultDetails}>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>正确题数：</Text>
              <Text style={[styles.resultDetailValue, { color: '#16A34A' }]}>
                {correctCount} / {trafficScenarios.length}
              </Text>
            </View>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>正确率：</Text>
              <Text style={[styles.resultDetailValue, { color: '#1E40AF' }]}>
                {Math.round((correctCount / trafficScenarios.length) * 100)}%
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
        
        <Text style={styles.headerTitle}>判断力训练</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {questionsLoading || trafficScenarios.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载训练题目中...</Text>
        </View>
      ) : (
      {gameState === 'intro' && renderIntro()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'result' && renderResult()}
      )}
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
  instructionText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: '#DC2626',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionCounter: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  timerContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
  },
  timerWarning: {
    color: '#B91C1C',
  },
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  scenarioImage: {
    width: '100%',
    height: 200,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 24,
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
    color: '#DC2626',
  },
  scoreLabel: {
    fontSize: 20,
    color: '#64748B',
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
    backgroundColor: '#DC2626',
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