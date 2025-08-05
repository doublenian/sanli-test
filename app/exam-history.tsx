import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy, Clock, Calendar, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { storage } from '@/utils/storage';
import { ExamResult } from '@/types/question';

export default function ExamHistoryScreen() {
  const router = useRouter();
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamHistory();
  }, []);

  const loadExamHistory = async () => {
    try {
      const results = await storage.getExamResults();
      setExamResults(results);
    } catch (error) {
      console.error('Failed to load exam history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getOverallStats = () => {
    if (examResults.length === 0) return { highest: 0, average: 0, passRate: 0 };
    
    const scores = examResults.map(result => result.score);
    const highest = Math.max(...scores);
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const passedCount = examResults.filter(result => result.passed).length;
    const passRate = Math.round((passedCount / examResults.length) * 100);
    
    return { highest, average, passRate };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载考试记录中...</Text>
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
        
        <Text style={styles.headerTitle}>考试记录</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {examResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Trophy size={64} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.emptyTitle}>暂无考试记录</Text>
          <Text style={styles.emptyDescription}>
            完成模拟考试后，您的成绩和详细记录将显示在这里。
          </Text>
          
          <TouchableOpacity
            style={styles.startExamButton}
            onPress={() => router.push('/exam')}
            activeOpacity={0.8}
          >
            <Text style={styles.startExamButtonText}>开始模拟考试</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Overall Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>总体统计</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Trophy size={24} color="#F59E0B" strokeWidth={2} />
                <Text style={styles.statNumber}>{stats.highest}</Text>
                <Text style={styles.statLabel}>最高分</Text>
              </View>
              <View style={styles.statItem}>
                <CheckCircle size={24} color="#16A34A" strokeWidth={2} />
                <Text style={styles.statNumber}>{stats.average}</Text>
                <Text style={styles.statLabel}>平均分</Text>
              </View>
              <View style={styles.statItem}>
                <Calendar size={24} color="#1E40AF" strokeWidth={2} />
                <Text style={styles.statNumber}>{stats.passRate}%</Text>
                <Text style={styles.statLabel}>通过率</Text>
              </View>
            </View>
          </View>

          {/* Exam Results List */}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>考试记录</Text>
            
            {examResults.map((result, index) => (
              <View key={result.id} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultDate}>
                      {formatDate(result.date)}
                    </Text>
                    <Text style={styles.resultTime}>
                      用时: {formatTime(result.timeSpent)}
                    </Text>
                  </View>
                  
                  <View style={styles.resultScore}>
                    <Text style={[
                      styles.scoreText,
                      result.passed ? { color: '#16A34A' } : { color: '#DC2626' }
                    ]}>
                      {result.score}分
                    </Text>
                    
                    <View style={[
                      styles.statusBadge,
                      result.passed 
                        ? { backgroundColor: '#DCFCE7' } 
                        : { backgroundColor: '#FEE2E2' }
                    ]}>
                      {result.passed ? (
                        <CheckCircle size={16} color="#16A34A" strokeWidth={2} />
                      ) : (
                        <XCircle size={16} color="#DC2626" strokeWidth={2} />
                      )}
                      <Text style={[
                        styles.statusText,
                        result.passed 
                          ? { color: '#16A34A' } 
                          : { color: '#DC2626' }
                      ]}>
                        {result.passed ? '合格' : '不合格'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.resultDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>答对题数：</Text>
                    <Text style={styles.detailValue}>
                      {result.correctAnswers}/{result.totalQuestions}
                    </Text>
                  </View>
                  
                  {result.wrongQuestions.length > 0 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>错题数量：</Text>
                      <Text style={[styles.detailValue, { color: '#DC2626' }]}>
                        {result.wrongQuestions.length}题
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
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
  startExamButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startExamButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
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
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  resultItem: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  resultTime: {
    fontSize: 14,
    color: '#64748B',
  },
  resultScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  resultDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
});