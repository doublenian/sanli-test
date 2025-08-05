import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 认证相关函数
export const auth = {
  // 注册新用户
  async signUp(email: string, password: string, userData: {
    username: string;
    fullName?: string;
    age?: number;
    phone?: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // 创建用户资料
    if (data.user) {
      const { error: profileError } = await supabase
        .from('app_users')
        .insert({
          id: data.user.id,
          username: userData.username,
          full_name: userData.fullName,
          age: userData.age,
          phone: userData.phone,
        });

      if (profileError) throw profileError;

      // 创建默认设置
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: data.user.id,
          font_size: 'large',
          voice_enabled: true,
          language: 'chinese',
        });

      if (settingsError) throw settingsError;
    }

    return data;
  },

  // 用户登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 更新最后活跃时间
    if (data.user) {
      await supabase
        .from('app_users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return data;
  },

  // 用户登出
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

// 题目相关函数
export const questions = {
  // 获取所有题目分类
  async getCategories() {
    const { data, error } = await supabase
      .from('question_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data;
  },

  // 获取随机题目
  async getRandomQuestions(count: number = 20, categoryId?: string) {
    const { data, error } = await supabase
      .rpc('get_random_questions', {
        p_count: count,
        p_category_id: categoryId || null,
      });

    if (error) throw error;
    return data;
  },

  // 获取顺序题目
  async getSequentialQuestions(startIndex: number = 0, count: number = 20, categoryId?: string) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .eq(categoryId ? 'category_id' : 'id', categoryId || 'id')
      .range(startIndex, startIndex + count - 1)
      .order('created_at');

    if (error) throw error;
    return data;
  },

  // 获取题库概览
  async getBankOverview() {
    const { data, error } = await supabase
      .from('question_bank_overview')
      .select('*');

    if (error) throw error;
    return data;
  },
};

// 考试相关函数
export const exams = {
  // 创建新考试
  async createExam(userId: string, examType: string = 'mock_exam') {
    const { data, error } = await supabase
      .from('exam_records')
      .insert({
        user_id: userId,
        exam_type: examType,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 完成考试
  async completeExam(examId: string, answers: any[]) {
    // 计算正确答案数
    const correctCount = answers.filter(a => a.is_correct).length;
    
    // 使用数据库函数完成考试
    const { error: completeError } = await supabase
      .rpc('complete_exam', {
        p_exam_id: examId,
        p_total_questions: answers.length,
        p_correct_answers: correctCount,
        p_time_spent: answers.reduce((total, a) => total + (a.answer_time || 0), 0),
      });

    if (completeError) throw completeError;

    // 批量插入答题记录
    const { error: answersError } = await supabase
      .rpc('batch_insert_answers', {
        p_user_id: answers[0]?.user_id,
        p_exam_id: examId,
        p_answers: answers,
      });

    if (answersError) throw answersError;

    // 获取更新后的考试记录
    const { data, error } = await supabase
      .from('exam_records')
      .select('*')
      .eq('id', examId)
      .single();

    if (error) throw error;
    return data;
  },

  // 获取用户考试历史
  async getUserExamHistory(userId: string, limit: number = 10) {
    const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-user-recent-exams`;
    const headers = {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };
    
    const url = new URL(apiUrl);
    url.searchParams.set('p_user_id', userId);
    url.searchParams.set('p_limit', limit.toString());
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    return data;
  },

  // 获取考试统计
  async getUserExamStats(userId: string) {
    const { data, error } = await supabase
      .rpc('calculate_user_exam_stats', {
        p_user_id: userId,
      })
      .single();

    if (error) throw error;
    return data;
  },
};

// 练习相关函数
export const practice = {
  // 创建练习会话
  async createSession(userId: string, sessionType: string, categoryId?: string) {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        category_id: categoryId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 记录答题
  async recordAnswer(userId: string, questionId: string, userAnswer: string, isCorrect: boolean, sessionId?: string) {
    const { data, error } = await supabase
      .from('user_question_answers')
      .insert({
        user_id: userId,
        question_id: questionId,
        practice_session_id: sessionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
      })
      .select()
      .single();

    if (error) throw error;

    // 更新错题状态和学习进度
    await supabase.rpc('manage_wrong_question', {
      p_user_id: userId,
      p_question_id: questionId,
      p_is_correct: isCorrect,
    });

    return data;
  },

  // 获取用户学习进度
  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_study_progress')
      .select(`
        *,
        question_categories (
          name,
          description,
          icon
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },
};

// 错题相关函数
export const wrongQuestions = {
  // 获取用户错题
  async getUserWrongQuestions(userId: string, includeMastered: boolean = false) {
    const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-user-wrong-questions`;
    const headers = {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };
    
    const url = new URL(apiUrl);
    url.searchParams.set('p_user_id', userId);
    url.searchParams.set('p_include_mastered', includeMastered.toString());
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    return data;
  },

  // 标记错题为已掌握
  async markAsMastered(userId: string, questionId: string) {
    const { error } = await supabase
      .from('user_wrong_questions')
      .update({ is_mastered: true })
      .eq('user_id', userId)
      .eq('question_id', questionId);

    if (error) throw error;
  },

  // 清空错题本
  async clearAllWrongQuestions(userId: string) {
    const { error } = await supabase
      .from('user_wrong_questions')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};

// 训练相关函数
export const training = {
  // 保存训练记录
  async saveTrainingRecord(userId: string, trainingType: string, score: number, duration: number, details: any) {
    const { data, error } = await supabase
      .from('training_records')
      .insert({
        user_id: userId,
        training_type: trainingType,
        score,
        duration,
        details,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 获取训练历史
  async getTrainingHistory(userId: string, trainingType?: string) {
    let query = supabase
      .from('training_records')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (trainingType) {
      query = query.eq('training_type', trainingType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};

// 用户设置相关函数
export const userSettings = {
  // 获取用户设置
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // 更新用户设置
  async updateUserSettings(userId: string, settings: Partial<any>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};