import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Trash2, Star, BookOpen } from 'lucide-react-native';
import { storage } from '@/utils/storage';
import { Question } from '@/types/question';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoriteQuestions, setFavoriteQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favorites = await storage.getFavoriteQuestions();
      setFavoriteQuestions(favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (questionId: string) => {
    Alert.alert(
      '移除收藏',
      '确定要将此题目从收藏中移除吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '移除', 
          style: 'destructive',
          onPress: async () => {
            await storage.removeFavoriteQuestion(questionId);
            setFavoriteQuestions(prev => prev.filter(q => q.id !== questionId));
          }
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      '清空收藏',
      '确定要清空所有收藏的题目吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定清空', 
          style: 'destructive',
          onPress: async () => {
            // Clear all favorites (we'll need to add this method to storage)
            for (const question of favoriteQuestions) {
              await storage.removeFavoriteQuestion(question.id);
            }
            setFavoriteQuestions([]);
          }
        },
      ]
    );
  };

  const handlePracticeFavorites = () => {
    if (favoriteQuestions.length === 0) {
      Alert.alert('提示', '收藏夹为空，请先在练习中收藏一些题目。');
      return;
    }
    
    // Navigate to favorites practice mode
    router.push('/question?mode=favorites');
  };

  const renderQuestionItem = (question: Question, index: number) => (
    <View key={question.id} style={styles.questionItem}>
      <View style={styles.questionHeader}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionNumber}>收藏 {index + 1}</Text>
          <Text style={styles.questionType}>
            {question.type === 'judgment' ? '判断题' : '选择题'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(question.id)}
          activeOpacity={0.8}
        >
          <Heart size={20} color="#DC2626" strokeWidth={2} fill="#DC2626" />
        </TouchableOpacity>
      </View>

      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.answerSection}>
        {question.type === 'judgment' ? (
          <View style={styles.judgmentAnswer}>
            <Text style={styles.answerLabel}>正确答案：</Text>
            <Text style={[
              styles.answerValue,
              { color: question.correctAnswer ? '#16A34A' : '#DC2626' }
            ]}>
              {question.correctAnswer ? '正确' : '错误'}
            </Text>
          </View>
        ) : (
          <View style={styles.multipleChoiceAnswer}>
            <Text style={styles.answerLabel}>正确答案：</Text>
            <Text style={styles.correctOption}>
              {question.options && question.options[question.correctAnswer as number]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.explanationSection}>
        <Text style={styles.explanationTitle}>解析：</Text>
        <Text style={styles.explanationText}>{question.explanation}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载收藏中...</Text>
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
        
        <Text style={styles.headerTitle}>我的收藏</Text>

        {favoriteQuestions.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
            activeOpacity={0.8}
          >
            <Trash2 size={24} color="#DC2626" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {favoriteQuestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Star size={64} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.emptyTitle}>收藏夹为空</Text>
          <Text style={styles.emptyDescription}>
            在题库练习中，点击题目右上角的心形图标即可收藏重要题目。
          </Text>
          
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() => router.push('/practice')}
            activeOpacity={0.8}
          >
            <Text style={styles.practiceButtonText}>开始练习</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>收藏统计</Text>
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{favoriteQuestions.length}</Text>
                <Text style={styles.statLabel}>收藏总数</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {favoriteQuestions.filter(q => q.type === 'judgment').length}
                </Text>
                <Text style={styles.statLabel}>判断题</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {favoriteQuestions.filter(q => q.type === 'multiple_choice').length}
                </Text>
                <Text style={styles.statLabel}>选择题</Text>
              </View>
            </View>
          </View>

          {/* Practice Button */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.practiceAllButton}
              onPress={handlePracticeFavorites}
              activeOpacity={0.8}
            >
              <BookOpen size={24} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.practiceAllButtonText}>练习收藏题目</Text>
            </TouchableOpacity>
          </View>

          {/* Questions List */}
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.questionsContainer}>
              {favoriteQuestions.map((question, index) => 
                renderQuestionItem(question, index)
              )}
            </View>
          </ScrollView>
        </>
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
  clearButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 20,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  practiceButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  practiceButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  practiceAllButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  practiceAllButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  questionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
  },
  questionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeButton: {
    padding: 4,
  },
  questionText: {
    fontSize: 18,
    color: '#1E293B',
    lineHeight: 26,
    marginBottom: 16,
  },
  answerSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  judgmentAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  answerValue: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  multipleChoiceAnswer: {},
  correctOption: {
    fontSize: 16,
    color: '#D97706',
    fontWeight: '600',
    marginTop: 4,
  },
  explanationSection: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
});