import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Volume2, CircleCheck as CheckCircle, Circle as XCircle, Eye, Heart } from 'lucide-react-native';
import { storage } from '@/utils/storage';
import { Question } from '@/types/question';
import { questions } from '@/lib/supabase';

export default function QuestionScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string | number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [mode]);

  useEffect(() => {
    checkIfFavorite();
  }, [currentIndex, practiceQuestions]);

  const loadQuestions = async () => {
    console.log('Loading questions for mode:', mode);
    try {
      if (mode === 'wrong') {
        const wrongQuestions = await storage.getWrongQuestions();
        console.log('Loaded wrong questions:', wrongQuestions.length);
        setPracticeQuestions(wrongQuestions);
      } else if (mode === 'favorites') {
        const favoriteQuestions = await storage.getFavoriteQuestions();
        console.log('Loaded favorite questions:', favoriteQuestions.length);
        setPracticeQuestions(favoriteQuestions);
      } else if (mode === 'random') {
        const data = await questions.getRandomQuestions(20);
        console.log('Loaded random questions from DB:', data?.length || 0);
        const formattedQuestions = formatQuestionsFromDB(data);
        console.log('Formatted random questions:', formattedQuestions.length);
        setPracticeQuestions(formattedQuestions);
      } else {
        const data = await questions.getSequentialQuestions(0, 20);
        console.log('Loaded sequential questions from DB:', data?.length || 0);
        const formattedQuestions = formatQuestionsFromDB(data);
        console.log('Formatted sequential questions:', formattedQuestions.length);
        setPracticeQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      // Set empty array to prevent infinite loading
      setPracticeQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatQuestionsFromDB = (data: any[]): Question[] => {
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(q => ({
      id: q.id,
      type: q.type as 'judgment' | 'multiple_choice',
      category: getCategoryFromId(q.category_id) as 'memory' | 'judgment' | 'reaction',
      question: q.question_text,
      options: q.options,
      correctAnswer: q.type === 'judgment' ? (q.correct_answer === 'true') : parseInt(q.correct_answer),
      explanation: q.explanation,
      imageUrl: q.image_url
    }));
  };

  const getCategoryFromId = (categoryId: string) => {
    // Map category IDs to category names
    // This is a simplified mapping - you might want to make this more robust
    return 'judgment'; // Default category
  };

  const checkIfFavorite = async () => {
    if (currentQuestion) {
      const favorite = await storage.isFavoriteQuestion(currentQuestion.id);
      setIsFavorite(favorite);
    }
  };

  const toggleFavorite = async () => {
    if (!currentQuestion) return;
    
    if (isFavorite) {
      await storage.removeFavoriteQuestion(currentQuestion.id);
      setIsFavorite(false);
    } else {
      await storage.addFavoriteQuestion(currentQuestion);
      setIsFavorite(true);
    }
  };

  const currentQuestion = practiceQuestions[currentIndex];

  const handleAnswer = async (answer: string | number) => {
    setUserAnswer(answer);
    setShowExplanation(true);
    setAnsweredQuestions(prev => new Set([...prev, currentIndex]));

    // Update practice progress and handle wrong answers
    const isCorrect = answer === currentQuestion.correctAnswer;
    await storage.updatePracticeProgress(currentQuestion.id, isCorrect);
    
    if (!isCorrect) {
      await storage.addWrongQuestions([currentQuestion]);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer(null);
      setShowExplanation(false);
    } else {
      // Finished all questions
      router.back();
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer(null);
      setShowExplanation(false);
    }
  };

  const isCorrect = userAnswer === currentQuestion?.correctAnswer;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载题目中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#1E40AF" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {mode === 'wrong' ? '错题练习' : mode === 'random' ? '随机练习' : '顺序练习'}
          </Text>

          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>没有可用题目</Text>
          <Text style={styles.emptyDescription}>
            {mode === 'wrong' && '错题本为空，请先进行练习添加错题。'}
            {mode === 'favorites' && '收藏夹为空，请先收藏一些题目。'}
            {mode === 'sequential' && '题库数据加载失败，请重试。'}
            {mode === 'random' && '题库数据加载失败，请重试。'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>返回练习</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#1E40AF" strokeWidth={2} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {mode === 'wrong' ? '错题练习' : mode === 'random' ? '随机练习' : '顺序练习'}
        </Text>

        <TouchableOpacity
          style={styles.voiceButton}
          onPress={() => {
            // Voice synthesis would be implemented here
            console.log('Playing voice for:', currentQuestion.question);
          }}
          activeOpacity={0.8}
        >
          <Volume2 size={24} color="#1E40AF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {practiceQuestions.length}
          </Text>
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            activeOpacity={0.8}
          >
            <Heart 
              size={24} 
              color={isFavorite ? "#F59E0B" : "#94A3B8"} 
              strokeWidth={2}
              fill={isFavorite ? "#F59E0B" : "none"}
            />
          </TouchableOpacity>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              第 {currentIndex + 1} 题
            </Text>
            <Text style={styles.questionType}>
              {currentQuestion.type === 'judgment' ? '判断题' : '选择题'}
            </Text>
          </View>

          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>

          {currentQuestion.imageUrl && (
            <View style={styles.questionImageContainer}>
              <Text style={styles.questionImagePlaceholder}>
                [交通标志图片]
              </Text>
            </View>
          )}

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.type === 'judgment' ? (
              <View style={styles.judgmentOptions}>
                <TouchableOpacity
                  style={[
                    styles.judgmentButton,
                    userAnswer === true && styles.selectedOption,
                    showExplanation && userAnswer === true && 
                      (isCorrect ? styles.correctOption : styles.incorrectOption)
                  ]}
                  onPress={() => handleAnswer(true)}
                  disabled={showExplanation}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.judgmentButtonText,
                    userAnswer === true && styles.selectedOptionText
                  ]}>
                    正确
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.judgmentButton,
                    userAnswer === false && styles.selectedOption,
                    showExplanation && userAnswer === false && 
                      (isCorrect ? styles.correctOption : styles.incorrectOption)
                  ]}
                  onPress={() => handleAnswer(false)}
                  disabled={showExplanation}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.judgmentButtonText,
                    userAnswer === false && styles.selectedOptionText
                  ]}>
                    错误
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.multipleChoiceOptions}>
                {currentQuestion.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      userAnswer === index && styles.selectedOption,
                      showExplanation && userAnswer === index && 
                        (isCorrect ? styles.correctOption : styles.incorrectOption),
                      showExplanation && index === currentQuestion.correctAnswer && styles.correctOption
                    ]}
                    onPress={() => handleAnswer(index)}
                    disabled={showExplanation}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.optionText,
                      userAnswer === index && styles.selectedOptionText,
                      showExplanation && index === currentQuestion.correctAnswer && styles.correctOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Answer Result */}
          {showExplanation && (
            <View style={styles.resultContainer}>
              <View style={[
                styles.resultHeader,
                isCorrect ? styles.correctResult : styles.incorrectResult
              ]}>
                {isCorrect ? (
                  <CheckCircle size={24} color="#16A34A" strokeWidth={2} />
                ) : (
                  <XCircle size={24} color="#DC2626" strokeWidth={2} />
                )}
                <Text style={[
                  styles.resultText,
                  isCorrect ? { color: '#16A34A' } : { color: '#DC2626' }
                ]}>
                  {isCorrect ? '回答正确！' : '回答错误'}
                </Text>
              </View>

              <View style={styles.explanationContainer}>
                <View style={styles.explanationHeader}>
                  <Eye size={20} color="#1E40AF" strokeWidth={2} />
                  <Text style={styles.explanationTitle}>详细解析</Text>
                </View>
                <Text style={styles.explanationText}>
                  {currentQuestion.explanation}
                </Text>
              </View>

              {mode === 'wrong' && isCorrect && (
                <TouchableOpacity
                  style={styles.removeFromErrorsButton}
                  onPress={async () => {
                    await storage.removeWrongQuestion(currentQuestion.id);
                    // Remove from current questions list and go to next
                    const newQuestions = practiceQuestions.filter(q => q.id !== currentQuestion.id);
                    setPracticeQuestions(newQuestions);
                    if (currentIndex >= newQuestions.length) {
                      router.back();
                    } else {
                      setUserAnswer(null);
                      setShowExplanation(false);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeFromErrorsText}>从错题本中移除</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={previousQuestion}
          disabled={currentIndex === 0}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.navButtonText,
            currentIndex === 0 && styles.navButtonTextDisabled
          ]}>
            上一题
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            !showExplanation && styles.navButtonDisabled,
            currentIndex === practiceQuestions.length - 1 && styles.finishButton
          ]}
          onPress={nextQuestion}
          disabled={!showExplanation}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.navButtonText,
            !showExplanation && styles.navButtonTextDisabled,
            currentIndex === practiceQuestions.length - 1 && styles.finishButtonText
          ]}>
            {currentIndex === practiceQuestions.length - 1 ? '完成练习' : '下一题'}
          </Text>
        </TouchableOpacity>
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
  backButton: {
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
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E40AF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  questionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
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
    minHeight: 64,
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
    minHeight: 64,
    justifyContent: 'center',
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
  correctOption: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  correctOptionText: {
    color: '#16A34A',
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
  incorrectOption: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  resultContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  correctResult: {
    backgroundColor: '#F0FDF4',
  },
  incorrectResult: {
    backgroundColor: '#FEF2F2',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
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
    color: '#FFFFFF',
  },
  removeFromErrorsButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  removeFromErrorsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});