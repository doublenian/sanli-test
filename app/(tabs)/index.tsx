import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, BookOpen, Target, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const mainActions = [
    {
      title: '模拟考试',
      subtitle: '全真模拟，20题20分钟',
      icon: Play,
      color: '#1E40AF',
      onPress: () => router.push('/exam'),
    },
    {
      title: '题库练习',
      subtitle: '逐题练习，查看解析',
      icon: BookOpen,
      color: '#059669',
      onPress: () => router.push('/practice'),
    },
    {
      title: '专项训练',
      subtitle: '记忆力、判断力、反应力',
      icon: Target,
      color: '#DC2626',
      onPress: () => router.push('/training'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>三力测试通</Text>
          <Text style={styles.subtitle}>帮助您轻松通过驾驶员三力测试</Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <TrendingUp size={24} color="#1E40AF" strokeWidth={2} />
            <Text style={styles.progressTitle}>学习进度</Text>
          </View>
          <View style={styles.progressContent}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>题库完成度</Text>
              <Text style={styles.progressValue}>65%</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>最高分</Text>
              <Text style={styles.progressValue}>95分</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>平均分</Text>
              <Text style={styles.progressValue}>87分</Text>
            </View>
          </View>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          {mainActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.actionContent}>
                <action.icon size={32} color="#FFFFFF" strokeWidth={2} />
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>220+</Text>
            <Text style={styles.statLabel}>题库总数</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>已完成考试</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>错题待复习</Text>
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