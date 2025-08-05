import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Phone, Calendar } from 'lucide-react-native';
import { auth } from '@/lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    age: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('提示', '请填写必填信息：用户名、邮箱、密码');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('提示', '密码长度至少6位');
      return;
    }

    setLoading(true);
    try {
      await auth.signUp(formData.email, formData.password, {
        username: formData.username,
        fullName: formData.fullName || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        phone: formData.phone || undefined,
      });

      Alert.alert(
        '注册成功',
        '账号注册成功！请登录开始使用。',
        [{ text: '立即登录', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      let errorMessage = '注册过程中出现错误，请重试';
      if (error.message && error.message.includes('over_email_send_rate_limit')) {
        errorMessage = '发送邮件过于频繁，请等待50秒后再试';
      } else if (error.message && error.message.includes('User already registered')) {
        errorMessage = '该邮箱已被注册，请直接登录或使用其他邮箱注册。';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('注册失败', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#1E40AF" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.title}>创建账号</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>注册后可同步学习进度</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Required Fields */}
            <Text style={styles.sectionTitle}>基本信息 *</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={24} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="用户名"
                  placeholderTextColor="#94A3B8"
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={24} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="邮箱地址"
                  placeholderTextColor="#94A3B8"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={24} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="密码（至少6位）"
                  placeholderTextColor="#94A3B8"
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={24} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="确认密码"
                  placeholderTextColor="#94A3B8"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Optional Fields */}
            <Text style={styles.sectionTitle}>其他信息（可选）</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={24} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="真实姓名（可选）"
                  placeholderTextColor="#94A3B8"
                  value={formData.fullName}
                  onChangeText={(value) => updateFormData('fullName', value)}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Calendar size={24} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="年龄（可选）"
                  placeholderTextColor="#94A3B8"
                  value={formData.age}
                  onChangeText={(value) => updateFormData('age', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Phone size={24} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="手机号码（可选）"
                  placeholderTextColor="#94A3B8"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                {loading ? '注册中...' : '创建账号'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>已有账号？</Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                activeOpacity={0.8}
              >
                <Text style={styles.loginLink}>立即登录</Text>
              </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginTop: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#1E293B',
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  registerButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  registerButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  loginText: {
    fontSize: 16,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 8,
  },
  guestButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  guestButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
});