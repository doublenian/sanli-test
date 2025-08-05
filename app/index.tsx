import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, BookOpen, LogIn } from 'lucide-react-native';
import { useAuth } from '@/components/AuthProvider';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in, navigate to main app
    if (!loading && user) {
      router.replace('/(tabs)');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <BookOpen size={80} color="#1E40AF" strokeWidth={2} />
          </View>
          <Text style={styles.appName}>三力测试通3.0</Text>
          <Text style={styles.tagline}>帮助您轻松通过驾驶员三力测试</Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>✅ 官方题库同步</Text>
            <Text style={styles.featureDesc}>220+道真题，与考试完全一致</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🎯 专项能力训练</Text>
            <Text style={styles.featureDesc}>记忆力、判断力、反应力针对性提升</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📊 智能错题管理</Text>
            <Text style={styles.featureDesc}>自动收集错题，高效查漏补缺</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.8}
          >
            <Users size={24} color="#64748B" strokeWidth={2} />
            <Text style={styles.guestButtonText}>游客模式体验</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
          >
            <LogIn size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.loginButtonText}>登录账号</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/auth/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>创建新账号</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            专为70岁以上驾驶员设计 • 界面简洁 • 操作简单
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  brandingSection: {
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 20,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 28,
  },
  featuresSection: {
    paddingVertical: 40,
  },
  featureItem: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 18,
    color: '#64748B',
    lineHeight: 24,
  },
  actionSection: {
    paddingBottom: 40,
  },
  guestButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  guestButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  registerButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
});