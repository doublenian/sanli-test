/*
  # 专项训练和用户数据表

  1. New Tables
    - `training_records` - 专项训练记录表
      - `id` (uuid, primary key) - 训练记录ID
      - `user_id` (uuid) - 用户ID
      - `training_type` (varchar) - 训练类型（memory/judgment/reaction）
      - `score` (integer) - 得分
      - `max_score` (integer) - 满分
      - `duration` (integer) - 训练时长（秒）
      - `details` (jsonb) - 详细数据（JSON格式）
      - `completed_at` (timestamp) - 完成时间

    - `user_wrong_questions` - 用户错题表
      - `id` (uuid, primary key) - 记录ID
      - `user_id` (uuid) - 用户ID
      - `question_id` (uuid) - 题目ID
      - `wrong_count` (integer) - 答错次数
      - `first_wrong_at` (timestamp) - 首次答错时间
      - `last_wrong_at` (timestamp) - 最后答错时间
      - `is_mastered` (boolean) - 是否已掌握

    - `user_favorite_questions` - 用户收藏题目表
      - `id` (uuid, primary key) - 记录ID
      - `user_id` (uuid) - 用户ID
      - `question_id` (uuid) - 题目ID
      - `created_at` (timestamp) - 收藏时间

    - `user_settings` - 用户设置表
      - `user_id` (uuid, primary key) - 用户ID
      - `font_size` (varchar) - 字体大小（standard/large/extra_large）
      - `voice_enabled` (boolean) - 语音播报开关
      - `language` (varchar) - 语言设置（chinese/english）
      - `theme` (varchar) - 主题设置
      - `auto_play_voice` (boolean) - 自动播放语音
      - `show_hints` (boolean) - 显示提示

    - `user_study_progress` - 用户学习进度表
      - `id` (uuid, primary key) - 记录ID
      - `user_id` (uuid) - 用户ID
      - `category_id` (uuid) - 分类ID
      - `total_questions` (integer) - 该分类总题数
      - `completed_questions` (integer) - 已完成题数
      - `correct_questions` (integer) - 答对题数
      - `last_study_date` (timestamp) - 最后学习日期
      - `completion_rate` (numeric) - 完成率
      - `accuracy_rate` (numeric) - 正确率

  2. Security
    - 启用所有表的RLS
    - 用户只能访问自己的数据
    - 错题和收藏表支持完整的CRUD操作
*/

-- 创建专项训练记录表
CREATE TABLE IF NOT EXISTS training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  training_type varchar(20) NOT NULL CHECK (training_type IN ('memory', 'judgment', 'reaction')),
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 100,
  duration integer NOT NULL DEFAULT 0,
  details jsonb DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 创建用户错题表
CREATE TABLE IF NOT EXISTS user_wrong_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  wrong_count integer DEFAULT 1,
  first_wrong_at timestamptz DEFAULT now(),
  last_wrong_at timestamptz DEFAULT now(),
  is_mastered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- 创建用户收藏题目表
CREATE TABLE IF NOT EXISTS user_favorite_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- 创建用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  font_size varchar(20) DEFAULT 'large' CHECK (font_size IN ('standard', 'large', 'extra_large')),
  voice_enabled boolean DEFAULT true,
  language varchar(10) DEFAULT 'chinese' CHECK (language IN ('chinese', 'english')),
  theme varchar(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  auto_play_voice boolean DEFAULT true,
  show_hints boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建用户学习进度表
CREATE TABLE IF NOT EXISTS user_study_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES question_categories(id) ON DELETE CASCADE,
  total_questions integer NOT NULL DEFAULT 0,
  completed_questions integer DEFAULT 0,
  correct_questions integer DEFAULT 0,
  last_study_date timestamptz DEFAULT now(),
  completion_rate numeric(5,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  accuracy_rate numeric(5,2) DEFAULT 0.00 CHECK (accuracy_rate >= 0 AND accuracy_rate <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- 启用RLS
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wrong_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_study_progress ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 训练记录表策略
CREATE POLICY "Users can manage their own training records"
  ON training_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户错题表策略
CREATE POLICY "Users can manage their own wrong questions"
  ON user_wrong_questions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户收藏题目表策略
CREATE POLICY "Users can manage their own favorite questions"
  ON user_favorite_questions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户设置表策略
CREATE POLICY "Users can manage their own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户学习进度表策略
CREATE POLICY "Users can manage their own study progress"
  ON user_study_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_training_records_user_id ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_type ON training_records(training_type);
CREATE INDEX IF NOT EXISTS idx_training_records_completed ON training_records(completed_at);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_user_id ON user_wrong_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_question_id ON user_wrong_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_wrong_questions_mastered ON user_wrong_questions(is_mastered);
CREATE INDEX IF NOT EXISTS idx_favorite_questions_user_id ON user_favorite_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_id ON user_study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_category ON user_study_progress(category_id);