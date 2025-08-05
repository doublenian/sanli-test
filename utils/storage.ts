import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExamResult, TrainingResult, Question } from '@/types/question';

const STORAGE_KEYS = {
  EXAM_RESULTS: 'exam_results',
  TRAINING_RESULTS: 'training_results',
  WRONG_QUESTIONS: 'wrong_questions',
  FAVORITE_QUESTIONS: 'favorite_questions',
  USER_SETTINGS: 'user_settings',
  PRACTICE_PROGRESS: 'practice_progress',
};

export interface UserSettings {
  fontSize: 'standard' | 'large' | 'extra-large';
  voiceEnabled: boolean;
  language: 'chinese' | 'english';
}

export interface PracticeProgress {
  completedQuestions: string[];
  wrongAnswers: string[];
  lastStudyDate: string;
}

// Storage utility functions
export const storage = {
  // Exam Results
  async saveExamResult(result: ExamResult): Promise<void> {
    try {
      const existingResults = await this.getExamResults();
      const updatedResults = [result, ...existingResults];
      await AsyncStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(updatedResults));
    } catch (error) {
      console.error('Error saving exam result:', error);
    }
  },

  async getExamResults(): Promise<ExamResult[]> {
    try {
      const results = await AsyncStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
      return results ? JSON.parse(results) : [];
    } catch (error) {
      console.error('Error getting exam results:', error);
      return [];
    }
  },

  // Training Results
  async saveTrainingResult(result: TrainingResult): Promise<void> {
    try {
      const existingResults = await this.getTrainingResults();
      const updatedResults = [result, ...existingResults];
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINING_RESULTS, JSON.stringify(updatedResults));
    } catch (error) {
      console.error('Error saving training result:', error);
    }
  },

  async getTrainingResults(): Promise<TrainingResult[]> {
    try {
      const results = await AsyncStorage.getItem(STORAGE_KEYS.TRAINING_RESULTS);
      return results ? JSON.parse(results) : [];
    } catch (error) {
      console.error('Error getting training results:', error);
      return [];
    }
  },

  // Wrong Questions (Error Collection)
  async addWrongQuestions(questions: Question[]): Promise<void> {
    try {
      const existingWrong = await this.getWrongQuestions();
      const existingIds = new Set(existingWrong.map(q => q.id));
      const newQuestions = questions.filter(q => !existingIds.has(q.id));
      const updatedWrong = [...existingWrong, ...newQuestions];
      await AsyncStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(updatedWrong));
    } catch (error) {
      console.error('Error adding wrong questions:', error);
    }
  },

  async getWrongQuestions(): Promise<Question[]> {
    try {
      const questions = await AsyncStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
      return questions ? JSON.parse(questions) : [];
    } catch (error) {
      console.error('Error getting wrong questions:', error);
      return [];
    }
  },

  async removeWrongQuestion(questionId: string): Promise<void> {
    try {
      const wrongQuestions = await this.getWrongQuestions();
      const updated = wrongQuestions.filter(q => q.id !== questionId);
      await AsyncStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing wrong question:', error);
    }
  },

  async clearWrongQuestions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WRONG_QUESTIONS);
    } catch (error) {
      console.error('Error clearing wrong questions:', error);
    }
  },

  // Favorite Questions
  async addFavoriteQuestion(question: Question): Promise<void> {
    try {
      const favorites = await this.getFavoriteQuestions();
      const isAlreadyFavorite = favorites.some(q => q.id === question.id);
      if (!isAlreadyFavorite) {
        const updated = [question, ...favorites];
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_QUESTIONS, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error adding favorite question:', error);
    }
  },

  async getFavoriteQuestions(): Promise<Question[]> {
    try {
      const questions = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_QUESTIONS);
      return questions ? JSON.parse(questions) : [];
    } catch (error) {
      console.error('Error getting favorite questions:', error);
      return [];
    }
  },

  async removeFavoriteQuestion(questionId: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteQuestions();
      const updated = favorites.filter(q => q.id !== questionId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_QUESTIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing favorite question:', error);
    }
  },

  async isFavoriteQuestion(questionId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteQuestions();
      return favorites.some(q => q.id === questionId);
    } catch (error) {
      console.error('Error checking favorite question:', error);
      return false;
    }
  },

  // User Settings
  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  },

  async getUserSettings(): Promise<UserSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return settings ? JSON.parse(settings) : {
        fontSize: 'large',
        voiceEnabled: true,
        language: 'chinese'
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        fontSize: 'large',
        voiceEnabled: true,
        language: 'chinese'
      };
    }
  },

  // Practice Progress
  async updatePracticeProgress(questionId: string, isCorrect: boolean): Promise<void> {
    try {
      const progress = await this.getPracticeProgress();
      
      // Add to completed questions
      if (!progress.completedQuestions.includes(questionId)) {
        progress.completedQuestions.push(questionId);
      }
      
      // Add to wrong answers if incorrect
      if (!isCorrect && !progress.wrongAnswers.includes(questionId)) {
        progress.wrongAnswers.push(questionId);
      }
      
      // Remove from wrong answers if now correct
      if (isCorrect && progress.wrongAnswers.includes(questionId)) {
        progress.wrongAnswers = progress.wrongAnswers.filter(id => id !== questionId);
      }
      
      progress.lastStudyDate = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating practice progress:', error);
    }
  },

  async getPracticeProgress(): Promise<PracticeProgress> {
    try {
      const progress = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_PROGRESS);
      return progress ? JSON.parse(progress) : {
        completedQuestions: [],
        wrongAnswers: [],
        lastStudyDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting practice progress:', error);
      return {
        completedQuestions: [],
        wrongAnswers: [],
        lastStudyDate: new Date().toISOString()
      };
    }
  },

  async resetPracticeProgress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PRACTICE_PROGRESS);
    } catch (error) {
      console.error('Error resetting practice progress:', error);
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
};