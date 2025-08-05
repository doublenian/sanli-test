import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { questions, exams, practice, wrongQuestions, training, trainingQuestions, userSettings } from '@/lib/supabase';
import { Question } from '@/types/question';

// Hook for managing questions data
export function useQuestions() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await questions.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomQuestions = async (count: number = 20, categoryId?: string) => {
    try {
      return await questions.getRandomQuestions(count, categoryId);
    } catch (error) {
      console.error('Error getting random questions:', error);
      return [];
    }
  };

  const getSequentialQuestions = async (startIndex: number = 0, count: number = 20, categoryId?: string) => {
    try {
      return await questions.getSequentialQuestions(startIndex, count, categoryId);
    } catch (error) {
      console.error('Error getting sequential questions:', error);
      return [];
    }
  };

  return {
    categories,
    loading,
    getRandomQuestions,
    getSequentialQuestions,
  };
}

// Hook for managing exam data
export function useExams() {
  const { user } = useAuth();
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [examStats, setExamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadExamData();
    }
  }, [user]);

  const loadExamData = async () => {
    if (!user) return;
    
    try {
      const [history, stats] = await Promise.all([
        exams.getUserExamHistory(user.id),
        exams.getUserExamStats(user.id),
      ]);
      setExamHistory(history);
      setExamStats(stats);
    } catch (error) {
      console.error('Error loading exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExam = async (examType: string = 'mock_exam') => {
    if (!user) return null;
    
    try {
      return await exams.createExam(user.id, examType);
    } catch (error) {
      console.error('Error creating exam:', error);
      return null;
    }
  };

  const completeExam = async (examId: string, answers: any[]) => {
    try {
      const result = await exams.completeExam(examId, answers);
      await loadExamData(); // Refresh data
      return result;
    } catch (error) {
      console.error('Error completing exam:', error);
      return null;
    }
  };

  return {
    examHistory,
    examStats,
    loading,
    createExam,
    completeExam,
    refreshData: loadExamData,
  };
}

// Hook for managing practice sessions
export function usePractice() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    
    try {
      const data = await practice.getUserProgress(user.id);
      setProgress(data);
    } catch (error) {
      console.error('Error loading practice progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionType: string, categoryId?: string) => {
    if (!user) return null;
    
    try {
      return await practice.createSession(user.id, sessionType, categoryId);
    } catch (error) {
      console.error('Error creating practice session:', error);
      return null;
    }
  };

  const recordAnswer = async (questionId: string, userAnswer: string, isCorrect: boolean, sessionId?: string) => {
    if (!user) return null;
    
    try {
      const result = await practice.recordAnswer(user.id, questionId, userAnswer, isCorrect, sessionId);
      await loadProgress(); // Refresh progress
      return result;
    } catch (error) {
      console.error('Error recording answer:', error);
      return null;
    }
  };

  return {
    progress,
    loading,
    createSession,
    recordAnswer,
    refreshProgress: loadProgress,
  };
}

// Hook for managing wrong questions
export function useWrongQuestions() {
  const { user } = useAuth();
  const [wrongQuestionsList, setWrongQuestionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWrongQuestions();
    }
  }, [user]);

  const loadWrongQuestions = async () => {
    if (!user) return;
    
    try {
      const data = await wrongQuestions.getUserWrongQuestions(user.id);
      setWrongQuestionsList(data);
    } catch (error) {
      console.error('Error loading wrong questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsMastered = async (questionId: string) => {
    if (!user) return;
    
    try {
      await wrongQuestions.markAsMastered(user.id, questionId);
      await loadWrongQuestions(); // Refresh data
    } catch (error) {
      console.error('Error marking question as mastered:', error);
    }
  };

  const clearAll = async () => {
    if (!user) return;
    
    try {
      await wrongQuestions.clearAllWrongQuestions(user.id);
      setWrongQuestionsList([]);
    } catch (error) {
      console.error('Error clearing wrong questions:', error);
    }
  };

  return {
    wrongQuestions: wrongQuestionsList,
    loading,
    markAsMastered,
    clearAll,
    refreshData: loadWrongQuestions,
  };
}

// Hook for managing training records
export function useTraining() {
  const { user } = useAuth();
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrainingHistory();
    }
    loadTrainingQuestions();
  }, [user]);

  const loadTrainingHistory = async () => {
    if (!user) return;
    
    try {
      const data = await training.getTrainingHistory(user.id);
      setTrainingHistory(data);
    } catch (error) {
      console.error('Error loading training history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingQuestions = async () => {
    try {
      const data = await trainingQuestions.getAllTrainingQuestions();
      const questionsMap = data.reduce((acc, item) => {
        acc[item.training_type] = item.question_data;
        return acc;
      }, {});
      setTrainingData(questionsMap);
    } catch (error) {
      console.error('Error loading training questions:', error);
    }
  };

  const saveTrainingRecord = async (trainingType: string, score: number, duration: number, details: any) => {
    if (!user) return null;
    
    try {
      const result = await training.saveTrainingRecord(user.id, trainingType, score, duration, details);
      await loadTrainingHistory(); // Refresh data
      return result;
    } catch (error) {
      console.error('Error saving training record:', error);
      return null;
    }
  };

  return {
    trainingHistory,
    trainingData,
    loading,
    saveTrainingRecord,
    loadTrainingQuestions,
    refreshData: loadTrainingHistory,
  };
}

// Hook for managing user settings
export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      // Load default settings for guest users
      setSettings({
        font_size: 'large',
        voice_enabled: true,
        language: 'chinese',
        theme: 'light',
        auto_play_voice: true,
        show_hints: true,
      });
      setLoading(false);
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const data = await userSettings.getUserSettings(user.id);
      setSettings(data);
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<any>) => {
    if (!user) {
      // For guest users, just update local state
      setSettings(prev => ({ ...prev, ...newSettings }));
      return;
    }
    
    try {
      const result = await userSettings.updateUserSettings(user.id, newSettings);
      setSettings(result);
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadSettings,
  };
}