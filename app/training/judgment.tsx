import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, Play, RotateCcw } from 'lucide-react-native';

const trafficScenarios = [
  {
    id: 1,
    scenario: "前方出现校车停车上下学生",
    image: "https://images.pexels.com/photos/159558/yellow-school-bus-driving-children-159558.jpeg",
    question: "此时您应该怎么做？",
    options: [
      "鸣笛催促校车快速通过",
      "减速慢行，保持安全距离", 
      "加速从左侧超越校车",
      "紧跟校车后方通过"
    ],
    correctAnswer: 1,
    explanation: "遇到校车上下学生时，应当减速慢行并保持安全距离，确保学生安全。严禁鸣笛催促或强行超越。"
  },
  {
    id: 2,
    scenario: "雨天行驶，前方车辆急刹车",
    image: "https://images.pexels.com/photos/210126/pexels-photo-210126.jpeg",
    question: "在这种情况下，正确的做法是？",
    options: [
      "立即急刹车跟着停下",
      "轻踩制动，逐渐减速",
      "向左变道避开前车",
      "加速从右侧超越"
    ],
    correctAnswer: 1,
    explanation: "雨天路面湿滑，应当轻踩制动逐渐减速，避免急刹车导致车辆失控或追尾事故。"
  },
  {
    id: 3,
    scenario: "高速公路上发现前方有事故",
    image: "https://images.pexels.com/photos/2365457/pexels-photo-2365457.jpeg",
    question: "发现前方有交通事故时应该？",
    options: [
      "立即停车查看情况",
      "减速慢行，注意避让",
      "鸣笛提醒其他车辆",
      "拍照发朋友圈"
    ],
    correctAnswer: 1,
    explanation: "发现前方事故时应减速慢行，注意避让，确保自身安全。不应停车围观或做其他妨碍交通的行为。"
  },
  {
    id: 4,
    scenario: "夜间会车遇到远光灯照射",
    image: "https://images.pexels.com/photos/210199/pexels-photo-210199.jpeg",
    question: "被对方远光灯照射影响视线时应该？",
    options: [
      "用远光灯回射对方",
      "减速慢行，必要时停车避让",
      "加速快速通过会车点",
      "紧急制动立即停车"
    ],
    correctAnswer: 1,
    explanation: "遇到远光灯照射时应减速慢行，必要时可停车避让，等待视线恢复后再继续行驶。不应用远光灯回射。"
  },
  {
    id: 5,
    scenario: "城市道路遇到救护车鸣笛",
    image: "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg",
    question: "听到救护车鸣笛声应该？",
    options: [
      "保持原车道正常行驶",
      "立即靠边停车让行",
      "加速抢在救护车前通过",
      "跟在救护车后方行驶"
    ],
    correctAnswer: 1,
    explanation: "听到救护车等特种车辆鸣笛时，应立即靠边停车让行，为抢救生命让出通道。"
  }
];

export default function JudgmentTrainingScreen() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const currentScenario = trafficScenarios[currentIndex];

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
    setTimeLeft(60);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    if (answerIndex === currentScenario.correctAnswer) {
      setScore(score + 20);
    }

    // Move to next question or finish
    if (currentIndex < trafficScenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(60);
    } else {
      // Calculate final score
      const finalScore = newAnswers.reduce((acc, answer, index) => {
        if (answer === trafficScenarios[index].correctAnswer) {
          return acc + 20;
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
          <Text style={styles.instructionText}>• 思考时间：60秒/题</Text>
          <Text style={styles.instructionText}>• 答对得分：20分/题</Text>
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

      {gameState === 'intro' && renderIntro()}
      {gameState === 'playing' && renderGame()}
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