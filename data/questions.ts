import { Question } from '@/types/question';

// Base URL for Supabase Edge Functions
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be provided');
}

const headers = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

// 获取所有题目
export const getAllQuestions = async (): Promise<Question[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-questions`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map(transformDatabaseQuestionToLocal);
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// 获取随机题目
export const getRandomQuestions = async (count: number = 20): Promise<Question[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-questions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'random',
        count,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map(transformDatabaseQuestionToLocal);
  } catch (error) {
    console.error('Error fetching random questions:', error);
    // 返回空数组作为fallback，避免应用崩溃
    return [];
  }
};

// 获取按分类的题目
export const getQuestionsByCategory = async (category: Question['category']): Promise<Question[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-questions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'by_category',
        category,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map(transformDatabaseQuestionToLocal);
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    return [];
  }
};

// 获取顺序题目
export const getSequentialQuestions = async (startIndex: number = 0, count: number = 20): Promise<Question[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-questions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'sequential',
        startIndex,
        count,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map(transformDatabaseQuestionToLocal);
  } catch (error) {
    console.error('Error fetching sequential questions:', error);
    return [];
  }
};

// 将数据库格式的题目转换为本地格式
const transformDatabaseQuestionToLocal = (dbQuestion: any): Question => {
  return {
    id: dbQuestion.id,
    type: dbQuestion.type as 'judgment' | 'multiple_choice',
    category: getCategoryFromCategoryId(dbQuestion.category_id),
    question: dbQuestion.question_text,
    options: dbQuestion.options,
    correctAnswer: parseCorrectAnswer(dbQuestion.correct_answer, dbQuestion.type),
    explanation: dbQuestion.explanation,
    imageUrl: dbQuestion.image_url,
  };
};

// 根据 category_id 获取 category 名称
const getCategoryFromCategoryId = (categoryId: string | null): Question['category'] => {
  // 这里需要根据实际的分类ID映射来转换
  // 假设分类ID映射关系如下：
  switch (categoryId) {
    case 'memory-category-id':
      return 'memory';
    case 'judgment-category-id':
      return 'judgment';
    case 'reaction-category-id':
      return 'reaction';
    default:
      return 'judgment'; // 默认分类
  }
};

// 解析正确答案
const parseCorrectAnswer = (correctAnswer: string, type: string): string | number => {
  if (type === 'judgment') {
    return correctAnswer === 'true' || correctAnswer === '1';
  } else {
    // multiple_choice 类型，返回选项索引
    return parseInt(correctAnswer, 10);
  }
};

// 获取题目总数（用于统计）
export const getQuestionsCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-questions-count`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching questions count:', error);
    return 220; // 返回默认数量
  }
};

// 向后兼容的导出（保持现有组件不需要大量修改）
export const questionBank: Question[] = [];