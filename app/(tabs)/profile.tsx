import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trophy, Clock, BookOpen, Circle as XCircle, TrendingUp, Calendar, LogOut } from 'lucide-react-native';
import { useAuth } from '@/components/AuthProvider';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const userStats = {
    totalExams: 15,
    highestScore: 95,
    averageScore: 87,
    totalStudyTime: '8小时30分钟',
    errorQuestions: 8,
    streakDays: 7,
  };

  const recentExams = [
    { date: '2025-01-15', score: 95, time: '18分钟', status: '合格' },
    { date: '2025-01-14', score: 85, time: '19分钟', status: '不合格' },
    { date: '2025-01-13', score: 90, time: '17分钟', status: '合格' },
    { date: '2025-01-12', score: 88, time: '20分钟', status: '不合格' },
    { date: '2025-01-11', score: 92, time: '16分钟', status: '合格' },
  ];

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

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#DC2626' }]}
            onPress={() => router.push('/errors')}
            activeOpacity={0.8}
          >
            <XCircle size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.quickActionText}>错题本</Text>
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