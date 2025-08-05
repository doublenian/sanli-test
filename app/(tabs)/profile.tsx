import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Trophy, Clock, BookOpen, Circle as XCircle, TrendingUp, Calendar, LogOut } from 'lucide-react-native';
import { useAuth } from '@/components/AuthProvider';
import { useExams, useWrongQuestions, useTraining } from '@/hooks/useSupabaseData';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { examHistory, examStats, loading: examLoading } = useExams();
  const { wrongQuestions, loading: wrongQuestionsLoading } = useWrongQuestions();
  const { trainingHistory, loading: trainingLoading } = useTraining();

  // 当页面获得焦点时检查登录状态
  useFocusEffect(
    React.useCallback(() => {
      if (!loading && !user) {
        // 用户未登录，跳转到登录页面
        setTimeout(() => {
          router.replace('/auth/login');
        }, 0);
      }
    }, [user, loading, router])
  );

  // Calculate user stats from real data
  const userStats = React.useMemo(() => {
    if (!examStats || examLoading) {
      return {
        totalExams: 0,
        highestScore: 0,
        averageScore: 0,
        totalStudyTime: '0小时0分钟',
        errorQuestions: 0,
        streakDays: 0,
      };
    }

    // Calculate total study time from training history
    const totalMinutes = trainingHistory?.reduce((total, record) => {
      return total + Math.floor(record.duration / 60);
    }, 0) || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalStudyTime = `${hours}小时${minutes}分钟`;

    // Calculate streak days (simplified - consecutive days with exams)
    const streakDays = calculateStreakDays(examHistory || []);

    return {
      totalExams: examStats.total_exams || 0,
      highestScore: examStats.highest_score || 0,
      averageScore: Math.round(examStats.average_score || 0),
      totalStudyTime,
      errorQuestions: wrongQuestions?.length || 0,
      streakDays,
    };
  }, [examStats, examLoading, trainingHistory, examHistory, wrongQuestions]);

  // Format recent exams data
  const recentExams = React.useMemo(() => {
    if (!examHistory) return [];
    
    return examHistory.slice(0, 5).map(exam => ({
      date: new Date(exam.completed_at).toISOString().split('T')[0],
      score: exam.score,
      time: formatDuration(exam.time_spent),
      status: exam.is_passed ? '合格' : '不合格'
    }));
  }, [examHistory]);

  // Helper function to calculate streak days
  function calculateStreakDays(exams: any[]): number {
    if (!exams || exams.length === 0) return 0;
    
    const sortedExams = [...exams].sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const exam of sortedExams) {
      const examDate = new Date(exam.completed_at);
      examDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = examDate;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  }

  // Helper function to format duration
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分钟`;
  }

  // Show loading state
  if (examLoading || wrongQuestionsLoading || trainingLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载用户数据中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>我的学习</Text>
          <Text style={styles.subtitle}>查看学习进度和成绩记录</Text>
        </View>

        {/* Achievement Stats */}
        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>学习成就</Text>
          <View style={styles.achievementGrid}>
            <View style={styles.achievementItem}>
              <Trophy size={24} color="#F59E0B" strokeWidth={2} />
              <Text style={styles.achievementNumber}>{userStats.highestScore}</Text>
              <Text style={styles.achievementLabel}>最高分</Text>
            </View>
            <View style={styles.achievementItem}>
              <TrendingUp size={24} color="#16A34A" strokeWidth={2} />
              <Text style={styles.achievementNumber}>{userStats.averageScore}</Text>
              <Text style={styles.achievementLabel}>平均分</Text>
            </View>
            <View style={styles.achievementItem}>
              <Calendar size={24} color="#7C3AED" strokeWidth={2} />
              <Text style={styles.achievementNumber}>{userStats.streakDays}</Text>
              <Text style={styles.achievementLabel}>连续天数</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Clock size={20} color="#1E40AF" strokeWidth={2} />
            <Text style={styles.statValue}>{userStats.totalStudyTime}</Text>
            <Text style={styles.statLabel}>累计学习</Text>
          </View>
          <View style={styles.statCard}>
            <BookOpen size={20} color="#059669" strokeWidth={2} />
            <Text style={styles.statValue}>{userStats.totalExams}</Text>
            <Text style={styles.statLabel}>模拟考试</Text>
          </View>
          <View style={styles.statCard}>
            <XCircle size={20} color="#DC2626" strokeWidth={2} />
            <Text style={styles.statValue}>{userStats.errorQuestions}</Text>
            <Text style={styles.statLabel}>错题待复习</Text>
          </View>
        </View>

        {/* Recent Exams */}
        <View style={styles.examHistoryCard}>
          <View style={styles.examHistoryHeader}>
            <Text style={styles.examHistoryTitle}>最近考试记录</Text>
            <TouchableOpacity onPress={() => router.push('/exam-history')}>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.examList}>
            {recentExams.map((exam, index) => (
              <View key={index} style={styles.examItem}>
                <View style={styles.examDate}>
                  <Text style={styles.examDateText}>{exam.date}</Text>
                  <Text style={styles.examTimeText}>{exam.time}</Text>
                </View>
                
                <View style={styles.examScore}>
                  <Text style={[
                    styles.examScoreText,
                    exam.score >= 90 ? { color: '#16A34A' } : { color: '#DC2626' }
                  ]}>
                    {exam.score}分
                  </Text>
                </View>
                
                <View style={[
                  styles.examStatus,
                  exam.status === '合格' 
                    ? { backgroundColor: '#DCFCE7' } 
                    : { backgroundColor: '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.examStatusText,
                    exam.status === '合格' 
                      ? { color: '#16A34A' } 
                      : { color: '#DC2626' }
                  ]}>
                    {exam.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Auth Section */}
        <View style={styles.authSection}>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={signOut}
                activeOpacity={0.8}
              >
                <LogOut size={20} color="#DC2626" strokeWidth={2} />
                <Text style={styles.signOutText}>退出登录</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.loginPromptButton}
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginPromptText}>登录同步学习数据</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions - only show if user has data */}
        {(userStats.totalExams > 0 || userStats.errorQuestions > 0) && (
          <View style={styles.actionsContainer}>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: '#DC2626' }]}
                onPress={() => router.push('/errors')}
                activeOpacity={0.8}
              >
                <XCircle size={24} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.quickActionText}>错题本 ({userStats.errorQuestions})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: '#1E40AF' }]}
                onPress={() => router.push('/exam')}
                activeOpacity={0.8}
              >
                <Trophy size={24} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.quickActionText}>模拟考试</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  achievementCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  achievementLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  examHistoryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  examHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  examHistoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewAllText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '500',
  },
  examList: {
    gap: 12,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  examDate: {
    flex: 2,
  },
  examDateText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  examTimeText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  examScore: {
    flex: 1,
    alignItems: 'center',
  },
  examScoreText: {
    fontSize: 18,
    fontWeight: '600',
  },
  examStatus: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  examStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
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
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  authSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
  loginPromptButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  loginPromptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
});