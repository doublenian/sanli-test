import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Shuffle, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { useAuth } from '@/components/AuthProvider';
import { usePractice, useWrongQuestions } from '@/hooks/useSupabaseData';

export default function PracticeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { progress, loading: progressLoading } = usePractice();
  const { wrongQuestions, loading: wrongQuestionsLoading } = useWrongQuestions();
  const [selectedMode, setSelectedMode] = useState<'sequential' | 'random' | null>(null);

  // Calculate real practice stats
  const practiceStats = React.useMemo(() => {
    if (progressLoading || wrongQuestionsLoading) {
      return {
        totalQuestions: 220,
        completedQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      };
    }

    const totalQuestions = 220; // From question bank
    const completedQuestions = progress?.reduce((total, p) => total + (p.completed_questions || 0), 0) || 0;
    const correctAnswers = progress?.reduce((total, p) => total + (p.correct_questions || 0), 0) || 0;
    const wrongAnswers = wrongQuestions?.length || 0;

    return {
      totalQuestions,
      completedQuestions,
      correctAnswers,
      wrongAnswers,
    };
  }, [progress, wrongQuestions, progressLoading, wrongQuestionsLoading]);

  const completionRate = Math.round((practiceStats.completedQuestions / practiceStats.totalQuestions) * 100);
  const accuracyRate = practiceStats.completedQuestions > 0 
    ? Math.round((practiceStats.correctAnswers / practiceStats.completedQuestions) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>题库练习</Text>
          <Text style={styles.subtitle}>系统学习所有考试题目</Text>
        </View>

        {/* Progress Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>练习统计</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completionRate}%</Text>
              <Text style={styles.statLabel}>完成进度</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{accuracyRate}%</Text>
              <Text style={styles.statLabel}>正确率</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{practiceStats.wrongAnswers}</Text>
              <Text style={styles.statLabel}>错题数</Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
          <Text style={styles.progressText}>
            已完成 {practiceStats.completedQuestions}/{practiceStats.totalQuestions} 题
          </Text>
        </View>

        {/* Practice Modes */}
        <View style={styles.modesContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'sequential' && styles.modeButtonSelected
            ]}
            onPress={() => {
              setSelectedMode('sequential');
              router.push('/question?mode=sequential');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.modeContent}>
              <BookOpen size={28} color="#1E40AF" strokeWidth={2} />
              <View style={styles.modeText}>
                <Text style={styles.modeTitle}>顺序练习</Text>
                <Text style={styles.modeDescription}>
                  按题库顺序逐题练习，适合初次学习
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              selectedMode === 'random' && styles.modeButtonSelected
            ]}
            onPress={() => {
              setSelectedMode('random');
              router.push('/question?mode=random');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.modeContent}>
              <Shuffle size={28} color="#059669" strokeWidth={2} />
              <View style={styles.modeText}>
                <Text style={styles.modeTitle}>随机练习</Text>
                <Text style={styles.modeDescription}>
                  随机抽取题目练习，巩固学习效果
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#DC2626' }]}
            onPress={() => router.push('/errors')}
            activeOpacity={0.8}
          >
            <XCircle size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.quickActionText}>错题本 ({practiceStats.wrongAnswers})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#16A34A' }]}
            onPress={() => router.push('/favorites')}
            activeOpacity={0.8}
          >
            <CheckCircle size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.quickActionText}>我的收藏</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
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
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E40AF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  modesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  modeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonSelected: {
    borderColor: '#1E40AF',
  },
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  modeText: {
    marginLeft: 16,
    flex: 1,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});