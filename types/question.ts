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

export interface ExamResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  passed: boolean;
  wrongQuestions: Question[];
}

export interface TrainingResult {
  id: string;
  type: 'memory' | 'judgment' | 'reaction';
  date: string;
  score: number;
  duration: number; // in seconds
  details: any;
}