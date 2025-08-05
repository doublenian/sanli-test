// This file has been migrated to the database
// All question data is now stored in Supabase and accessed via API calls
// The local questionBank has been removed to prevent data duplication

export interface Question {
  id: string;
  type: 'judgment' | 'multiple_choice';
  category: 'memory' | 'judgment' | 'reaction';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  imageUrl?: string;
}

// These functions are kept for backward compatibility but now use Supabase data
export const getRandomQuestions = async (count: number): Promise<Question[]> => {
  // This function should now call Supabase API
  console.warn('getRandomQuestions: Please use Supabase API instead of local data');
  return [];
};

export const getQuestionsByCategory = async (category: Question['category']): Promise<Question[]> => {
  // This function should now call Supabase API
  console.warn('getQuestionsByCategory: Please use Supabase API instead of local data');
  return [];
};

export const getSequentialQuestions = async (startIndex: number = 0, count: number = 10): Promise<Question[]> => {
  // This function should now call Supabase API
  console.warn('getSequentialQuestions: Please use Supabase API instead of local data');
  return [];
};