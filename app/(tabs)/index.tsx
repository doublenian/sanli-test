import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, BookOpen, Target, TrendingUp } from 'lucide-react-native';
import { useAuth } from '@/components/AuthProvider';
import { useExams, useWrongQuestions, usePractice } from '@/hooks/useSupabaseData';
import { useHaptics } from '@/hooks/useHaptics';
import { FadeInView, AnimatedListItem } from '@/components/FadeInView';
import { SkeletonLoader, SkeletonStats, SkeletonCard } from '@/components/SkeletonLoader';
import { AnimatedButton } from '@/components/AnimatedButton';
import { storage } from '@/utils/storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const haptics = useHaptics();
  const { examStats, loading: examLoading } = useExams();
  const { wrongQuestions, loading: wrongQuestionsLoading } = useWrongQuestions();
  const { progress, loading: progressLoading } = usePractice();
  const [localStats, setLocalStats] = React.useState<any>(null);
  const [localLoading, setLocalLoading] = React.useState(true);

  // Load local storage data for guest users
  React.useEffect(() => {
    if (!user) {
      loadLocalStats();
    }
  }, [user]);

  const loadLocalStats = async () => {
    try {
      const [examResults, practiceProgress] = await Promise.all([
        storage.getExamResults(),
        storage.getPracticeProgress(),
      ]);
      
      setLocalStats({
        examResults,
        practiceProgress,
      });
    } catch (error) {
      console.error('Failed to load local stats:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Calculate real stats
  const userStats = React.useMemo(() => {
    const isLoading = user ? 
      (examLoading || wrongQuestionsLoading || progressLoading) : 
      localLoading;

    if (isLoading) {
      return {
        completionRate: 0,
        highestScore: 0,
        averageScore: 0,
        totalExams: 0,
        wrongQuestionsCount: 0,
      };
    }

    if (user) {
      // For authenticated users: use Supabase data
      const totalQuestions = 220; // From question bank
      const completedQuestions = progress?.reduce((total, p) => total + (p.completed_questions || 0), 0) || 0;
      const completionRate = Math.round((completedQuestions / totalQuestions) * 100);

      return {
        completionRate,
        highestScore: examStats?.highest_score || 0,
        averageScore: Math.round(Number(examStats?.average_score) || 0),
        totalExams: Number(examStats?.total_exams) || 0,
        wrongQuestionsCount: wrongQuestions?.length || 0,
      };
    } else {
      // For guest users: use local storage data
      const examResults = localStats?.examResults || [];
      const practiceProgress = localStats?.practiceProgress;
      
      // Calculate completion rate: completed questions / total questions
      const totalQuestions = 220;
      const completedQuestions = practiceProgress?.completedQuestions?.length || 0;
      const completionRate = Math.round((completedQuestions / totalQuestions) * 100);
      
      // Calculate highest score from exams
      const highestScore = examResults.length > 0 ? Math.max(...examResults.map((exam: any) => exam.score)) : 0;
      
      // Calculate average score: total scores / number of exams
      const totalScore = examResults.reduce((sum: number, exam: any) => sum + exam.score, 0);
      const averageScore = examResults.length > 0 ? Math.round(totalScore / examResults.length) : 0;

      return {
        completionRate,
        highestScore,
        averageScore,
        totalExams: examResults.length,
        wrongQuestionsCount: practiceProgress?.wrongAnswers?.length || 0,
      };
    }
  }, [user, examStats, wrongQuestions, progress, examLoading, wrongQuestionsLoading, progressLoading, localStats, localLoading]);

  const mainActions = [
    {
      title: '模拟考试',
      subtitle: '全真模拟，20题20分钟',
      icon: Play,
      color: '#1E40AF',
      onPress: () => {
        haptics.mediumImpact();
        router.push('/exam');
      },
    },
    {
      title: '题库练习',
      subtitle: '逐题练习，查看解析',
      icon: BookOpen,
      color: '#059669',
      onPress: () => {
        haptics.mediumImpact();
        router.push('/practice');
      },
    },
    {
      title: '专项训练',
      subtitle: '记忆力、判断力、反应力',
      icon: Target,
      color: '#DC2626',
      onPress: () => {
        haptics.mediumImpact();
        router.push('/training');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <FadeInView style={styles.header}>
          <Text style={styles.title}>三力测试通</Text>
          <Text style={styles.subtitle}>帮助您轻松通过驾驶员三力测试</Text>
        </FadeInView>

        {/* Progress Overview */}
        <FadeInView delay={200} style={styles.progressCard}>
          <>
            <View style={styles.progressHeader}>
              <TrendingUp size={24} color="#1E40AF" strokeWidth={2} />
              <Text style={styles.progressTitle}>学习进度</Text>
            </View>
            <View style={styles.progressContent}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>题库完成度</Text>
                <Text style={styles.progressValue}>{userStats.completionRate}%</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>最高分</Text>
                <Text style={styles.progressValue}>{userStats.highestScore}分</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>平均分</Text>
                <Text style={styles.progressValue}>{userStats.averageScore}分</Text>
              </View>
            </View>
          </>
        </FadeInView>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          {mainActions.map((action, index) => (
            <AnimatedListItem key={index} index={index} style={[styles.actionButton, { backgroundColor: action.color }]}>
              <TouchableOpacity
                style={styles.actionContent}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <action.icon size={32} color="#FFFFFF" strokeWidth={2} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            </AnimatedListItem>
          ))}
        </View>

        {/* Quick Stats */}
        <FadeInView delay={600} style={styles.statsContainer}>
          <>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>220+</Text>
              <Text style={styles.statLabel}>题库总数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalExams}</Text>
              <Text style={styles.statLabel}>已完成考试</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.wrongQuestionsCount}</Text>
              <Text style={styles.statLabel}>错题待复习</Text>
            </View>
          </>
        </FadeInView>
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
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 80,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});