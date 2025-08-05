import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Brain, Eye, Zap, Star } from 'lucide-react-native';

export default function TrainingScreen() {
  const router = useRouter();

  const trainingModules = [
    {
      title: '记忆力训练',
      description: '物品识记、数字复述等记忆力强化练习',
      icon: Brain,
      color: '#7C3AED',
      difficulty: '基础',
      duration: '5-10分钟',
      onPress: () => router.push('/training/memory'),
    },
    {
      title: '判断力训练',
      description: '交通标志识别、情景反应判断练习',
      icon: Eye,
      color: '#DC2626',
      difficulty: '中等',
      duration: '10-15分钟',
      onPress: () => router.push('/training/judgment'),
    },
    {
      title: '反应力训练',
      description: '快速响应、紧急制动等反应能力训练',
      icon: Zap,
      color: '#EA580C',
      difficulty: '进阶',
      duration: '5-8分钟',
      onPress: () => router.push('/training/reaction'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>专项训练</Text>
          <Text style={styles.subtitle}>针对性提升记忆力、判断力、反应力</Text>
        </View>

        {/* Training Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Star size={20} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.tipTitle}>训练建议</Text>
          </View>
          <Text style={styles.tipText}>
            建议每天进行10-15分钟的专项训练，从记忆力开始，循序渐进。坚持练习能有效提升考试通过率。
          </Text>
        </View>

        {/* Training Modules */}
        <View style={styles.modulesContainer}>
          {trainingModules.map((module, index) => (
            <TouchableOpacity
              key={index}
              style={styles.moduleCard}
              onPress={module.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.moduleIcon, { backgroundColor: module.color }]}>
                <module.icon size={32} color="#FFFFFF" strokeWidth={2} />
              </View>
              
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
                
                <View style={styles.moduleInfo}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>难度：</Text>
                    <Text style={[
                      styles.infoValue,
                      module.difficulty === '基础' && { color: '#16A34A' },
                      module.difficulty === '中等' && { color: '#EA580C' },
                      module.difficulty === '进阶' && { color: '#DC2626' },
                    ]}>{module.difficulty}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>时长：</Text>
                    <Text style={styles.infoValue}>{module.duration}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Training History */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>最近训练记录</Text>
          <View style={styles.historyList}>
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>今天 14:30</Text>
              <Text style={styles.historyModule}>记忆力训练</Text>
              <Text style={styles.historyScore}>85分</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>昨天 10:15</Text>
              <Text style={styles.historyModule}>判断力训练</Text>
              <Text style={styles.historyScore}>92分</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>前天 16:45</Text>
              <Text style={styles.historyModule}>反应力训练</Text>
              <Text style={styles.historyScore}>78分</Text>
            </View>
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
  tipCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 16,
    color: '#92400E',
    lineHeight: 24,
  },
  modulesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 12,
  },
  moduleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyCard: {
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
  historyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  historyDate: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  historyModule: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  historyScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
    textAlign: 'right',
  },
});