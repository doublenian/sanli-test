/*
  # 创建完整的三力测试应用数据库Schema

  1. 核心表结构
     - `app_users` - 应用用户信息
     - `question_categories` - 题目分类
     - `questions` - 题目库
     - `exam_records` - 考试记录
     - `user_question_answers` - 用户答题记录
     - `practice_sessions` - 练习会话
     - `training_records` - 训练记录
     - `user_wrong_questions` - 用户错题
     - `user_favorite_questions` - 用户收藏题目
     - `user_settings` - 用户设置
     - `user_study_progress` - 用户学习进度

  2. 视图和函数
     - 统计视图
     - 辅助函数

  3. 安全策略
     - 启用RLS
     - 创建访问策略
*/

-- 创建应用用户表
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  age integer,
  phone text,
  registration_date date DEFAULT CURRENT_DATE,
  last_active timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 创建题目分类表
CREATE TABLE IF NOT EXISTS question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active categories"
  ON question_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 创建题目表
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES question_categories(id),
  type text NOT NULL CHECK (type IN ('judgment', 'multiple_choice')),
  question_text text NOT NULL,
  options jsonb,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  image_url text,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 创建考试记录表
CREATE TABLE IF NOT EXISTS exam_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  exam_type text DEFAULT 'mock_exam',
  total_questions integer DEFAULT 20,
  correct_answers integer DEFAULT 0,
  score integer DEFAULT 0,
  time_spent integer DEFAULT 0,
  is_passed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own exam records"
  ON exam_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam records"
  ON exam_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam records"
  ON exam_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 创建用户答题记录表
CREATE TABLE IF NOT EXISTS user_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id),
  exam_record_id uuid REFERENCES exam_records(id) ON DELETE CASCADE,
  practice_session_id uuid,
  user_answer text NOT NULL,
  is_correct boolean NOT NULL,
  answer_time integer,
  answered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own answers"
  ON user_question_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_question_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 创建练习会话表
CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  session_type text DEFAULT 'sequential',
  category_id uuid REFERENCES question_categories(id),
  questions_completed integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own practice sessions"
  ON practice_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建训练记录表
CREATE TABLE IF NOT EXISTS training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  training_type text NOT NULL CHECK (training_type IN ('memory', 'judgment', 'reaction')),
  score integer DEFAULT 0,
  max_score integer DEFAULT 100,
  duration integer DEFAULT 0,
  details jsonb,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own training records"
  ON training_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建用户错题表
CREATE TABLE IF NOT EXISTS user_wrong_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id),
  wrong_count integer DEFAULT 1,
  first_wrong_at timestamptz DEFAULT now(),
  last_wrong_at timestamptz DEFAULT now(),
  is_mastered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE user_wrong_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wrong questions"
  ON user_wrong_questions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建用户收藏题目表
CREATE TABLE IF NOT EXISTS user_favorite_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE user_favorite_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorite questions"
  ON user_favorite_questions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  font_size text DEFAULT 'large' CHECK (font_size IN ('standard', 'large', 'extra_large')),
  voice_enabled boolean DEFAULT true,
  language text DEFAULT 'chinese' CHECK (language IN ('chinese', 'english')),
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  auto_play_voice boolean DEFAULT true,
  show_hints boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建用户学习进度表
CREATE TABLE IF NOT EXISTS user_study_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES question_categories(id),
  total_questions integer DEFAULT 0,
  completed_questions integer DEFAULT 0,
  correct_questions integer DEFAULT 0,
  last_study_date timestamptz DEFAULT now(),
  completion_rate numeric(5,2) DEFAULT 0,
  accuracy_rate numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id)
);

ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study progress"
  ON user_study_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_exam_records_user ON exam_records(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_records_completed ON exam_records(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_answers_user ON user_question_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_training_records_user ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_type ON training_records(training_type);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_user ON user_wrong_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user ON user_study_progress(user_id);

-- 创建统计函数
CREATE OR REPLACE FUNCTION calculate_user_exam_stats(p_user_id uuid)
RETURNS TABLE (
  total_exams bigint,
  total_passed bigint,
  highest_score integer,
  average_score numeric,
  total_study_time integer,
  pass_rate numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_exams,
    COUNT(*) FILTER (WHERE is_passed = true) as total_passed,
    COALESCE(MAX(score), 0) as highest_score,
    COALESCE(AVG(score), 0) as average_score,
    COALESCE(SUM(time_spent), 0) as total_study_time,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE is_passed = true)::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0
    END as pass_rate
  FROM exam_records 
  WHERE user_id = p_user_id AND completed_at IS NOT NULL;
END;
$$;

-- 创建获取随机题目函数
CREATE OR REPLACE FUNCTION get_random_questions(
  p_count integer DEFAULT 20,
  p_category_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  category_id uuid,
  type text,
  question_text text,
  options jsonb,
  correct_answer text,
  explanation text,
  image_url text,
  difficulty_level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.category_id,
    q.type,
    q.question_text,
    q.options,
    q.correct_answer,
    q.explanation,
    q.image_url,
    q.difficulty_level
  FROM questions q
  WHERE q.is_active = true
    AND (p_category_id IS NULL OR q.category_id = p_category_id)
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$;

-- 创建管理错题函数
CREATE OR REPLACE FUNCTION manage_wrong_question(
  p_user_id uuid,
  p_question_id uuid,
  p_is_correct boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_is_correct THEN
    -- 如果答对了，标记为已掌握
    UPDATE user_wrong_questions 
    SET is_mastered = true, updated_at = now()
    WHERE user_id = p_user_id AND question_id = p_question_id;
  ELSE
    -- 如果答错了，添加或更新错题记录
    INSERT INTO user_wrong_questions (user_id, question_id, wrong_count, first_wrong_at, last_wrong_at)
    VALUES (p_user_id, p_question_id, 1, now(), now())
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET
      wrong_count = user_wrong_questions.wrong_count + 1,
      last_wrong_at = now(),
      is_mastered = false,
      updated_at = now();
  END IF;
END;
$$;

-- 创建更新学习进度函数
CREATE OR REPLACE FUNCTION update_study_progress(
  p_user_id uuid,
  p_category_id uuid,
  p_is_correct boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_questions integer;
BEGIN
  -- 获取该分类的总题目数
  SELECT COUNT(*) INTO v_total_questions
  FROM questions
  WHERE category_id = p_category_id AND is_active = true;

  -- 更新或插入学习进度
  INSERT INTO user_study_progress (
    user_id, 
    category_id, 
    total_questions, 
    completed_questions, 
    correct_questions,
    last_study_date
  )
  VALUES (
    p_user_id, 
    p_category_id, 
    v_total_questions, 
    1, 
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id, category_id)
  DO UPDATE SET
    completed_questions = user_study_progress.completed_questions + 1,
    correct_questions = user_study_progress.correct_questions + 
      CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    last_study_date = now(),
    completion_rate = ROUND(
      ((user_study_progress.completed_questions + 1)::numeric / v_total_questions::numeric) * 100, 2
    ),
    accuracy_rate = ROUND(
      ((user_study_progress.correct_questions + CASE WHEN p_is_correct THEN 1 ELSE 0 END)::numeric / 
       (user_study_progress.completed_questions + 1)::numeric) * 100, 2
    ),
    updated_at = now();
END;
$$;

-- 创建统计视图
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
  u.id as user_id,
  u.username,
  u.full_name,
  u.last_active,
  COALESCE(exam_stats.total_exams, 0) as total_exams,
  COALESCE(exam_stats.highest_score, 0) as highest_score,
  COALESCE(exam_stats.average_score, 0) as average_score,
  COALESCE(exam_stats.pass_rate, 0) as pass_rate,
  COALESCE(progress_stats.total_questions_completed, 0) as total_questions_completed,
  COALESCE(progress_stats.overall_accuracy, 0) as overall_accuracy,
  COALESCE(wrong_stats.total_wrong_questions, 0) as total_wrong_questions,
  COALESCE(wrong_stats.mastered_wrong_questions, 0) as mastered_wrong_questions,
  COALESCE(training_stats.total_training_sessions, 0) as total_training_sessions
FROM app_users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_exams,
    MAX(score) as highest_score,
    ROUND(AVG(score)) as average_score,
    ROUND((COUNT(*) FILTER (WHERE is_passed = true)::numeric / COUNT(*)::numeric) * 100, 2) as pass_rate
  FROM exam_records 
  WHERE completed_at IS NOT NULL
  GROUP BY user_id
) exam_stats ON u.id = exam_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(completed_questions) as total_questions_completed,
    ROUND(AVG(accuracy_rate), 2) as overall_accuracy
  FROM user_study_progress
  GROUP BY user_id
) progress_stats ON u.id = progress_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_wrong_questions,
    COUNT(*) FILTER (WHERE is_mastered = true) as mastered_wrong_questions
  FROM user_wrong_questions
  GROUP BY user_id
) wrong_stats ON u.id = wrong_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_training_sessions
  FROM training_records
  GROUP BY user_id
) training_stats ON u.id = training_stats.user_id;

-- 创建题库概览视图
CREATE OR REPLACE VIEW question_bank_overview AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  c.description,
  c.icon,
  c.display_order,
  COUNT(q.id) as total_questions,
  COUNT(q.id) FILTER (WHERE q.type = 'judgment') as judgment_questions,
  COUNT(q.id) FILTER (WHERE q.type = 'multiple_choice') as multiple_choice_questions,
  ROUND(AVG(q.difficulty_level), 2) as avg_difficulty
FROM question_categories c
LEFT JOIN questions q ON c.id = q.category_id AND q.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.description, c.icon, c.display_order
ORDER BY c.display_order;