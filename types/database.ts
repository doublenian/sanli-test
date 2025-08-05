export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          age: number | null;
          phone: string | null;
          registration_date: string | null;
          last_active: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          age?: number | null;
          phone?: string | null;
          registration_date?: string | null;
          last_active?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          age?: number | null;
          phone?: string | null;
          registration_date?: string | null;
          last_active?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      question_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          display_order: number | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
      questions: {
        Row: {
          id: string;
          category_id: string | null;
          type: string;
          question_text: string;
          options: any | null;
          correct_answer: string;
          explanation: string;
          image_url: string | null;
          difficulty_level: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          type: string;
          question_text: string;
          options?: any | null;
          correct_answer: string;
          explanation: string;
          image_url?: string | null;
          difficulty_level?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          type?: string;
          question_text?: string;
          options?: any | null;
          correct_answer?: string;
          explanation?: string;
          image_url?: string | null;
          difficulty_level?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      exam_records: {
        Row: {
          id: string;
          user_id: string | null;
          exam_type: string;
          total_questions: number;
          correct_answers: number;
          score: number;
          time_spent: number;
          is_passed: boolean;
          started_at: string | null;
          completed_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          exam_type?: string;
          total_questions?: number;
          correct_answers?: number;
          score?: number;
          time_spent?: number;
          is_passed?: boolean;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          exam_type?: string;
          total_questions?: number;
          correct_answers?: number;
          score?: number;
          time_spent?: number;
          is_passed?: boolean;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
      };
      user_question_answers: {
        Row: {
          id: string;
          user_id: string | null;
          question_id: string | null;
          exam_record_id: string | null;
          practice_session_id: string | null;
          user_answer: string;
          is_correct: boolean;
          answer_time: number | null;
          answered_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          question_id?: string | null;
          exam_record_id?: string | null;
          practice_session_id?: string | null;
          user_answer: string;
          is_correct: boolean;
          answer_time?: number | null;
          answered_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          question_id?: string | null;
          exam_record_id?: string | null;
          practice_session_id?: string | null;
          user_answer?: string;
          is_correct?: boolean;
          answer_time?: number | null;
          answered_at?: string | null;
          created_at?: string | null;
        };
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          session_type: string;
          category_id: string | null;
          questions_completed: number | null;
          correct_count: number | null;
          started_at: string | null;
          last_activity: string | null;
          is_completed: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_type?: string;
          category_id?: string | null;
          questions_completed?: number | null;
          correct_count?: number | null;
          started_at?: string | null;
          last_activity?: string | null;
          is_completed?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_type?: string;
          category_id?: string | null;
          questions_completed?: number | null;
          correct_count?: number | null;
          started_at?: string | null;
          last_activity?: string | null;
          is_completed?: boolean | null;
          created_at?: string | null;
        };
      };
      training_records: {
        Row: {
          id: string;
          user_id: string | null;
          training_type: string;
          score: number;
          max_score: number;
          duration: number;
          details: any | null;
          completed_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          training_type: string;
          score?: number;
          max_score?: number;
          duration?: number;
          details?: any | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          training_type?: string;
          score?: number;
          max_score?: number;
          duration?: number;
          details?: any | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
      };
      user_wrong_questions: {
        Row: {
          id: string;
          user_id: string | null;
          question_id: string | null;
          wrong_count: number | null;
          first_wrong_at: string | null;
          last_wrong_at: string | null;
          is_mastered: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          question_id?: string | null;
          wrong_count?: number | null;
          first_wrong_at?: string | null;
          last_wrong_at?: string | null;
          is_mastered?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          question_id?: string | null;
          wrong_count?: number | null;
          first_wrong_at?: string | null;
          last_wrong_at?: string | null;
          is_mastered?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_favorite_questions: {
        Row: {
          id: string;
          user_id: string | null;
          question_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          question_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          question_id?: string | null;
          created_at?: string | null;
        };
      };
      user_study_progress: {
        Row: {
          id: string;
          user_id: string | null;
          category_id: string | null;
          total_questions: number;
          completed_questions: number | null;
          correct_questions: number | null;
          last_study_date: string | null;
          completion_rate: number | null;
          accuracy_rate: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          category_id?: string | null;
          total_questions?: number;
          completed_questions?: number | null;
          correct_questions?: number | null;
          last_study_date?: string | null;
          completion_rate?: number | null;
          accuracy_rate?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          category_id?: string | null;
          total_questions?: number;
          completed_questions?: number | null;
          correct_questions?: number | null;
          last_study_date?: string | null;
          completion_rate?: number | null;
          accuracy_rate?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      user_dashboard_stats: {
        Row: {
          user_id: string | null;
          username: string | null;
          full_name: string | null;
          last_active: string | null;
          total_exams: number | null;
          highest_score: number | null;
          average_score: number | null;
          pass_rate: number | null;
          total_questions_completed: number | null;
          overall_accuracy: number | null;
          total_wrong_questions: number | null;
          mastered_wrong_questions: number | null;
          total_training_sessions: number | null;
        };
      };
      question_bank_overview: {
        Row: {
          category_id: string | null;
          category_name: string | null;
          description: string | null;
          icon: string | null;
          display_order: number | null;
          total_questions: number | null;
          judgment_questions: number | null;
          multiple_choice_questions: number | null;
          avg_difficulty: number | null;
        };
      };
    };
    Functions: {
      update_study_progress: {
        Args: {
          p_user_id: string;
          p_category_id: string;
          p_is_correct: boolean;
        };
        Returns: void;
      };
      manage_wrong_question: {
        Args: {
          p_user_id: string;
          p_question_id: string;
          p_is_correct: boolean;
        };
        Returns: void;
      };
      get_random_questions: {
        Args: {
          p_count?: number;
          p_category_id?: string | null;
          p_exclude_mastered?: boolean;
          p_user_id?: string | null;
        };
        Returns: {
          id: string;
          category_id: string;
          type: string;
          question_text: string;
          options: any;
          correct_answer: string;
          explanation: string;
          image_url: string;
          difficulty_level: number;
        }[];
      };
      calculate_user_exam_stats: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          total_exams: string;     // COUNT(*) returns bigint -> string
          total_passed: string;    // COUNT(*) FILTER returns bigint -> string
          highest_score: number;   // MAX(score) returns integer -> number
          average_score: string;   // AVG(score) returns numeric -> string
          total_study_time: string; // SUM(time_spent) returns bigint -> string
          pass_rate: string;       // ROUND(...) returns numeric -> string
        };
      };
      get_user_wrong_questions: {
        Args: {
          p_user_id: string;
          p_include_mastered?: boolean;
          p_category_id?: string | null;
          p_limit?: number | null;
        };
        Returns: {
          question_id: string;
          question_text: string;
          question_type: string;
          options: any;
          correct_answer: string;
          explanation: string;
          image_url: string;
          wrong_count: number;
          first_wrong_at: string;
          last_wrong_at: string;
          is_mastered: boolean;
          category_name: string;
        }[];
      };
      complete_exam: {
        Args: {
          p_exam_id: string;
          p_total_questions: number;
          p_correct_answers: number;
          p_time_spent: number;
        };
        Returns: void;
      };
      batch_insert_answers: {
        Args: {
          p_user_id: string;
          p_exam_id: string;
          p_answers: any;
        };
        Returns: void;
      };
    };
  };
}