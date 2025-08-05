import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Brain, Play, RotateCcw } from 'lucide-react-native';

const memoryItems = [
  { id: 1, name: '苹果', emoji: '🍎' },
  { id: 2, name: '钥匙', emoji: '🔑' },
  { id: 3, name: '帽子', emoji: '👒' },
  { id: 4, name: '手表', emoji: '⌚' },
  { id: 5, name: '眼镜', emoji: '👓' },
  { id: 6, name: '手机', emoji: '📱' },
];

export default function MemoryTrainingScreen() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'intro' | 'memorize' | 'distraction' | 'test' | 'result'>('intro');
  const [itemsToRemember, setItemsToRemember] = useState<typeof memoryItems>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if ((gameState === 'memorize' || gameState === 'distraction') && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      if (gameState === 'memorize') {
        setGameState('distraction');
        setTimeLeft(5);
      } else if (gameState === 'distraction') {
        setGameState('test');
      }
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    // Select 4 random items to remember
    const shuffled = [...memoryItems].sort(() => 0.5 - Math.random());
    setItemsToRemember(shuffled.slice(0, 4));
    setGameState('memorize');
    setTimeLeft(10);
    setSelectedAnswers([]);
    setScore(0);
  };

  const toggleAnswer = (itemId: number) => {
    if (selectedAnswers.includes(itemId)) {
      setSelectedAnswers(selectedAnswers.filter(id => id !== itemId));
    } else {
      setSelectedAnswers([...selectedAnswers, itemId]);
    }
  };

  const submitTest = () => {
    const correctItems = itemsToRemember.map(item => item.id);
    const correctAnswers = selectedAnswers.filter(id => correctItems.includes(id));
    const incorrectAnswers = selectedAnswers.filter(id => !correctItems.includes(id));
    
    const newScore = Math.max(0, (correctAnswers.length * 25) - (incorrectAnswers.length * 10));
    setScore(newScore);
    setGameState('result');
  };

  const renderIntro = () => (
    <View style={styles.contentContainer}>
      <View style={styles.introCard}>
        <Brain size={64} color="#7C3AED" strokeWidth={2} />
        <Text style={styles.introTitle}>记忆力训练</Text>
        <Text style={styles.introDescription}>
          接下来将显示几个物品，请仔细记住它们。10秒后物品会消失，
          然后您需要从选项中选出刚才看到的物品。
        </Text>
        
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>游戏规则：</Text>
          <Text style={styles.instructionText}>• 观看时间：10秒</Text>
          <Text style={styles.instructionText}>• 记忆物品：4个</Text>
          <Text style={styles.instructionText}>• 选对得分：25分/个</Text>
          <Text style={styles.instructionText}>• 选错扣分：10分/个</Text>
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

  const renderMemorize = () => (
    <View style={styles.contentContainer}>
      <View style={styles.gameCard}>
        <Text style={styles.phaseTitle}>请记住这些物品</Text>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeLeft}秒</Text>
        </View>

        <View style={styles.itemsGrid}>
          {itemsToRemember.map((item) => (
            <View key={item.id} style={styles.memoryItem}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.memoryHint}>
          仔细观察并记住这些物品的名称
        </Text>
      </View>
    </View>
  );

  const renderDistraction = () => (
    <View style={styles.contentContainer}>
      <View style={styles.gameCard}>
        <Text style={styles.phaseTitle}>注意力分散任务</Text>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeLeft}秒</Text>
        </View>

        <View style={styles.distractionTask}>
          <Text style={styles.distractionQuestion}>
            请快速计算：15 + 28 = ?
          </Text>
          
          <View style={styles.calculationOptions}>
            <TouchableOpacity style={styles.calculationButton}>
              <Text style={styles.calculationButtonText}>41</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculationButton}>
              <Text style={styles.calculationButtonText}>43</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculationButton}>
              <Text style={styles.calculationButtonText}>45</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.distractionHint}>
          请集中注意力完成计算题
        </Text>
      </View>
    </View>
  );

  const renderTest = () => (
    <View style={styles.contentContainer}>
      <View style={styles.gameCard}>
        <Text style={styles.phaseTitle}>请选择刚才看到的物品</Text>
        
        <View style={styles.selectionGrid}>
          {memoryItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.selectionItem,
                selectedAnswers.includes(item.id) && styles.selectedItem
              ]}
              onPress={() => toggleAnswer(item.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.selectionEmoji}>{item.emoji}</Text>
              <Text style={[
                styles.selectionName,
                selectedAnswers.includes(item.id) && styles.selectedText
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.testHint}>
          已选择 {selectedAnswers.length} 个物品
        </Text>

        <TouchableOpacity
          style={[styles.submitButton, selectedAnswers.length === 0 && styles.submitButtonDisabled]}
          onPress={submitTest}
          disabled={selectedAnswers.length === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>提交答案</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResult = () => {
    const correctItems = itemsToRemember.map(item => item.id);
    const correctAnswers = selectedAnswers.filter(id => correctItems.includes(id));
    const missedItems = correctItems.filter(id => !selectedAnswers.includes(id));
    const wrongAnswers = selectedAnswers.filter(id => !correctItems.includes(id));

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
              <Text style={styles.resultDetailLabel}>正确选择：</Text>
              <Text style={[styles.resultDetailValue, { color: '#16A34A' }]}>
                {correctAnswers.length} 个
              </Text>
            </View>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>遗漏物品：</Text>
              <Text style={[styles.resultDetailValue, { color: '#EA580C' }]}>
                {missedItems.length} 个
              </Text>
            </View>
            <View style={styles.resultDetailRow}>
              <Text style={styles.resultDetailLabel}>错误选择：</Text>
              <Text style={[styles.resultDetailValue, { color: '#DC2626' }]}>
                {wrongAnswers.length} 个
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
        
        <Text style={styles.headerTitle}>记忆力训练</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {gameState === 'intro' && renderIntro()}
      {gameState === 'memorize' && renderMemorize()}
      {gameState === 'distraction' && renderDistraction()}
      {gameState === 'test' && renderTest()}
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
    backgroundColor: '#7C3AED',
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
  gameCard: {
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
  phaseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
    textAlign: 'center',
  },
  timerContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 50,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#DC2626',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  memoryItem: {
    alignItems: 'center',
    width: 80,
  },
  itemEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  memoryHint: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  distractionTask: {
    alignItems: 'center',
    marginBottom: 24,
  },
  distractionQuestion: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 24,
  },
  calculationOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  calculationButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 80,
    alignItems: 'center',
  },
  calculationButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E40AF',
  },
  distractionHint: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  selectionItem: {
    alignItems: 'center',
    width: 80,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1E40AF',
  },
  selectionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  selectionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  selectedText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  testHint: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
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
    color: '#7C3AED',
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
    backgroundColor: '#7C3AED',
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