import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, CircleCheck as CheckCircle, X } from 'lucide-react-native';
import { getRandomQuestions } from '@/data/questions';
import { storage } from '@/utils/storage';
import { Question } from '@/types/question';

export default function ExamScreen() {
  const router = useRouter();
  const [questions] = useState<Question[]>(() => getRandomQuestions(20));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | number | null)[]>(new Array(20).fill(null));
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [showResult, setShowResult] = useState(false);

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
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
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
    Alert.alert(
      '确认交卷',
      '您确定要提交考试吗？提交后将无法修改答案。',
      [
        { text: '继续答题', style: 'cancel' },
        { text: '确认交卷', onPress: finishExam },
      ]
    );
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
                <CheckCircle size={64} color="#16A34A" strokeWidth={2} />
              ) : (
                <X size={64} color="#DC2626" strokeWidth={2} />
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
              <TouchableOpacity
                style={[styles.resultButton, styles.retakeButton]}
                onPress={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers(new Array(20).fill(null));
                  setTimeLeft(20 * 60);
                  setShowResult(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.retakeButtonText}>再考一次</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.resultButton, styles.homeButton]}
                onPress={() => router.push('/')}
                activeOpacity={0.8}
              >
                <Text style={styles.homeButtonText}>返回首页</Text>
              </TouchableOpacity>
            </View>

            {questions.filter((_, index) => answers[index] !== questions[index].correctAnswer).length > 0 && (
              <TouchableOpacity
                style={styles.errorsButton}
                onPress={() => router.push('/errors')}
                activeOpacity={0.8}
              >
                <Text style={styles.errorsButtonText}>
                  查看错题解析 ({questions.filter((_, index) => answers[index] !== questions[index].correctAnswer).length}题)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
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
      <View style={styles.questionContainer}>
        <View style={styles.questionCard}>
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
                <TouchableOpacity
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
                </TouchableOpacity>
                
                <TouchableOpacity
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
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.multipleChoiceOptions}>
                {currentQuestion?.options?.map((option, index) => (
                  <TouchableOpacity
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
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={previousQuestion}
          disabled={currentQuestionIndex === 0}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.navButtonText,
            currentQuestionIndex === 0 && styles.navButtonTextDisabled
          ]}>
            上一题
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.finishButton]}
            onPress={confirmFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.finishButtonText}>交卷</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={nextQuestion}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>下一题</Text>
          </TouchableOpacity>
        )}
      </View>
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
  navButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  navButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#94A3B8',
  },
  finishButton: {
    backgroundColor: '#16A34A',
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
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
    gap: 16,
    marginBottom: 16,
  },
  resultButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#1E40AF',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  errorsButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});