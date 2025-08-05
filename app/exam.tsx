import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, CircleCheck as CheckCircle, X } from 'lucide-react-native';
import { getRandomQuestions } from '@/data/questions';
import { storage } from '@/utils/storage';
import { Question } from '@/types/question';
import { Dialog } from '@/components/Dialog';
import { useSpeech } from '@/hooks/useSpeech';
import { useHaptics } from '@/hooks/useHaptics';
import { FadeInView } from '@/components/FadeInView';
import { AnimatedButton } from '@/components/AnimatedButton';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ExamScreen() {
  const router = useRouter();
  const [questions] = useState<Question[]>(() => getRandomQuestions(20));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | number | null)[]>(new Array(20).fill(null));
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [showResult, setShowResult] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const speech = useSpeech();
  const haptics = useHaptics();

  const currentQuestion = questions[currentQuestionIndex];

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishExam();
    }
  }, [timeLeft, showResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string | number) => {
    haptics.selectionFeedback();
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  // 当题目变化时，自动播报新题目（考试模式下可选择性播报）
  useEffect(() => {
    if (currentQuestion && speech) {
      // 考试模式下延迟播报，给用户阅读时间
      const timer = setTimeout(() => {
        speech.speakQuestion(currentQuestion.question, currentQuestion.type);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, currentQuestion, speech]);
  const nextQuestion = () => {
    haptics.lightImpact();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    haptics.lightImpact();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishExam = async () => {
    let correctCount = 0;
    const wrongQuestions: Question[] = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
        // Update practice progress for correct answers
        storage.updatePracticeProgress(question.id, true);
      } else {
        wrongQuestions.push(question);
        // Update practice progress for wrong answers
        storage.updatePracticeProgress(question.id, false);
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 90;

    // Store exam result
    const examResult = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpent: (20 * 60) - timeLeft,
      passed,
      wrongQuestions,
    };

    // Save exam result and wrong questions
    await storage.saveExamResult(examResult);
    if (wrongQuestions.length > 0) {
      await storage.addWrongQuestions(wrongQuestions);
    }

    setShowResult(true);
  };

  const confirmFinish = () => {
    haptics.mediumImpact();
    setShowFinishDialog(true);
  };

  const handleFinishConfirm = () => {
    haptics.heavyImpact();
    setShowFinishDialog(false);
    finishExam();
  };

  const handleFinishCancel = () => {
    setShowFinishDialog(false);
  };

  if (showResult) {
    const correctCount = questions.reduce((count, question, index) => {
      return answers[index] === question.correctAnswer ? count + 1 : count;
    }, 0);
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 90;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultCard, passed ? styles.passedCard : styles.failedCard]}>
            <View style={styles.resultIcon}>
              {passed ? (
                <Animated.View>
                  <CheckCircle size={64} color="#16A34A" strokeWidth={2} />
                </Animated.View>
              ) : (
                <Animated.View>
                  <X size={64} color="#DC2626" strokeWidth={2} />
                </Animated.View>
              )}
            </View>
            
            <Text style={styles.resultTitle}>
              {passed ? '恭喜合格！' : '继续努力！'}
            </Text>
            
            <Text style={styles.resultScore}>{score}分</Text>
            
            <View style={styles.resultDetails}>
              <View style={styles.resultDetailItem}>
                <Text style={styles.resultDetailLabel}>正确题数</Text>
                <Text style={styles.resultDetailValue}>{correctCount}/{questions.length}</Text>
              </View>
              <View style={styles.resultDetailItem}>
                <Text style={styles.resultDetailLabel}>用时</Text>
                <Text style={styles.resultDetailValue}>
                  {formatTime((20 * 60) - timeLeft)}
                </Text>
              </View>
              <View style={styles.resultDetailItem}>
                <Text style={styles.resultDetailLabel}>合格线</Text>
                <Text style={styles.resultDetailValue}>90分</Text>
              </View>
            </View>

            <View style={styles.resultActions}>
              <AnimatedButton
                title="再考一次"
                onPress={() => {
                  haptics.mediumImpact();
                  setCurrentQuestionIndex(0);
                  setAnswers(new Array(20).fill(null));
                  setTimeLeft(20 * 60);
                  setShowResult(false);
                }}
                variant="primary"
                hapticType="medium"
                style={{ flex: 1, marginRight: 8 }}
              />
              
              <AnimatedButton
                title="返回首页"
                onPress={() => {
                  haptics.lightImpact();
                  router.push('/');
                }}
                variant="secondary"
                hapticType="light"
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            {questions.filter((_, index) => answers[index] !== questions[index].correctAnswer).length > 0 && (
              <AnimatedButton
                title={`查看错题解析 (${questions.filter((_, index) => answers[index] !== questions[index].correctAnswer).length}题)`}
                onPress={() => {
                  haptics.mediumImpact();
                  router.push('/errors');
                }}
                variant="warning"
                hapticType="medium"
                style={{ width: '100%', marginTop: 16 }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
      {/* Header with timer and progress */}
      <View style={styles.header}>
        <View style={styles.timerContainer}>
          <Clock size={20} color="#DC2626" strokeWidth={2} />
          <Text style={[
            styles.timerText,
            timeLeft < 300 && styles.timerWarning
          ]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
      </View>

      {/* Question */}
      <FadeInView style={styles.questionContainer}>
        <FadeInView delay={200} style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            第 {currentQuestionIndex + 1} 题
          </Text>
          
          <Text style={styles.questionText}>
            {currentQuestion?.question}
          </Text>

          {currentQuestion?.imageUrl && (
            <View style={styles.questionImageContainer}>
              <Text style={styles.questionImagePlaceholder}>
                [交通标志图片]
              </Text>
            </View>
          )}

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion?.type === 'judgment' ? (
              <View style={styles.judgmentOptions}>
                <AnimatedTouchableOpacity
                  style={[
                    styles.judgmentButton,
                    answers[currentQuestionIndex] === true && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.judgmentButtonText,
                    answers[currentQuestionIndex] === true && styles.selectedOptionText
                  ]}>
                    正确
                  </Text>
                </AnimatedTouchableOpacity>
                
                <AnimatedTouchableOpacity
                  style={[
                    styles.judgmentButton,
                    answers[currentQuestionIndex] === false && styles.selectedOption
                  ]}
                  onPress={() => handleAnswer(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.judgmentButtonText,
                    answers[currentQuestionIndex] === false && styles.selectedOptionText
                  ]}>
                    错误
                  </Text>
                </AnimatedTouchableOpacity>
              </View>
            ) : (
              <View style={styles.multipleChoiceOptions}>
                {currentQuestion?.options?.map((option, index) => (
                  <AnimatedTouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      answers[currentQuestionIndex] === index && styles.selectedOption
                    ]}
                    onPress={() => handleAnswer(index)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.optionText,
                      answers[currentQuestionIndex] === index && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </AnimatedTouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </FadeInView>
      </FadeInView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <AnimatedButton
          title="上一题"
          onPress={previousQuestion}
          disabled={currentQuestionIndex === 0}
          variant={currentQuestionIndex === 0 ? 'secondary' : 'primary'}
          hapticType="light"
          style={{ flex: 1, marginRight: 8 }}
        />

        {currentQuestionIndex === questions.length - 1 ? (
          <AnimatedButton
            title="交卷"
            onPress={confirmFinish}
            variant="success"
            hapticType="heavy"
            style={{ flex: 1, marginLeft: 8 }}
          />
        ) : (
          <AnimatedButton
            title="下一题"
            onPress={nextQuestion}
            variant="primary"
            hapticType="light"
            style={{ flex: 1, marginLeft: 8 }}
          />
        )}
      </View>
      </SafeAreaView>

      {/* Finish Exam Dialog */}
      <Dialog
        visible={showFinishDialog}
        title="确认交卷"
        message="您确定要提交考试吗？提交后将无法修改答案。"
        onCancel={handleFinishCancel}
        onConfirm={handleFinishConfirm}
        cancelText="继续答题"
        confirmText="确认交卷"
        type="warning"
      />
    </>
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  timerWarning: {
    color: '#DC2626',
  },
  progressContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    lineHeight: 30,
    color: '#1E293B',
    marginBottom: 24,
    fontWeight: '500',
  },
  questionImageContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  questionImagePlaceholder: {
    fontSize: 16,
    color: '#64748B',
  },
  optionsContainer: {
    marginTop: 8,
  },
  judgmentOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  judgmentButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  judgmentButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  multipleChoiceOptions: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 24,
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1E40AF',
  },
  selectedOptionText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  passedCard: {
    borderTopWidth: 4,
    borderTopColor: '#16A34A',
  },
  failedCard: {
    borderTopWidth: 4,
    borderTopColor: '#DC2626',
  },
  resultIcon: {
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 32,
  },
  resultDetails: {
    width: '100%',
    marginBottom: 32,
  },
  resultDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultDetailLabel: {
    fontSize: 18,
    color: '#64748B',
  },
  resultDetailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  resultActions: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
});