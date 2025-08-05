/*
  # 考试和练习相关数据表

  1. New Tables
    - `exam_records` - 考试记录表
      - `id` (uuid, primary key) - 考试记录ID
      - `user_id` (uuid) - 用户ID
      - `exam_type` (varchar) - 考试类型（mock_exam/practice_test）
      - `total_questions` (integer) - 总题数
      - `correct_answers` (integer) - 正确答案数
      - `score` (integer) - 得分
      - `time_spent` (integer) - 用时（秒）
      - `is_passed` (boolean) - 是否通过
      - `started_at` (timestamp) - 开始时间
      - `completed_at` (timestamp) - 完成时间

    - `user_question_answers` - 用户答题记录表
      - `id` (uuid, primary key) - 记录ID
      - `user_id` (uuid) - 用户ID
      - `question_id` (uuid) - 题目ID
      - `exam_record_id` (uuid) - 考试记录ID（可选）
      - `user_answer` (varchar) - 用户答案
      - `is_correct` (boolean) - 是否正确
      - `answer_time` (integer) - 答题用时（毫秒）
      - `answered_at` (timestamp) - 答题时间

    - `practice_sessions` - 练习会话表
      - `id` (uuid, primary key) - 会话ID
      - `user_id` (uuid) - 用户ID
      - `session_type` (varchar) - 会话类型（sequential/random/wrong_questions）
      - `questions_completed` (integer) - 完成题数
      - `correct_count` (integer) - 正确题数
      - `started_at` (timestamp) - 开始时间
      - `last_activity` (timestamp) - 最后活动时间
      - `is_completed` (boolean) - 是否完成

  2. Security
    - 启用所有表的RLS
    - 用户只能访问自己的记录
*/

-- 创建考试记录表
CREATE TABLE IF NOT EXISTS exam_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  exam_type varchar(20) NOT NULL DEFAULT 'mock_exam' CHECK (exam_type IN ('mock_exam', 'practice_test')),
  total_questions integer NOT NULL DEFAULT 20,
  correct_answers integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  time_spent integer NOT NULL DEFAULT 0,
  is_passed boolean NOT NULL DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 创建用户答题记录表
CREATE TABLE IF NOT EXISTS user_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  exam_record_id uuid REFERENCES exam_records(id) ON DELETE CASCADE,
  practice_session_id uuid,
  user_answer varchar(10) NOT NULL,
  is_correct boolean NOT NULL,
  answer_time integer DEFAULT 0,
  answered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 创建练习会话表
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  session_type varchar(20) NOT NULL DEFAULT 'sequential' CHECK (session_type IN ('sequential', 'random', 'wrong_questions', 'category')),
  category_id uuid REFERENCES question_categories(id) ON DELETE SET NULL,
  questions_completed integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 启用RLS
ALTER TABLE exam_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 考试记录表策略
CREATE POLICY "Users can manage their own exam records"
  ON exam_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 答题记录表策略
CREATE POLICY "Users can manage their own answers"
  ON user_question_answers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 练习会话表策略
CREATE POLICY "Users can manage their own practice sessions"
  ON practice_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_exam_records_user_id ON exam_records(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_records_completed_at ON exam_records(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_question_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_exam_id ON user_question_answers(exam_record_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_type ON practice_sessions(session_type);

-- 添加外键约束到用户答题记录表
ALTER TABLE user_question_answers 
ADD CONSTRAINT fk_practice_session 
FOREIGN KEY (practice_session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE;