/*
  # 三力测试通核心数据表结构

  1. New Tables
    - `app_users` - 应用用户表
      - `id` (uuid, primary key) - 用户ID，与Supabase auth.users关联
      - `username` (varchar) - 用户名
      - `full_name` (varchar) - 真实姓名
      - `age` (integer) - 年龄
      - `phone` (varchar) - 联系电话
      - `registration_date` (timestamp) - 注册日期
      - `last_active` (timestamp) - 最后活跃时间
      - `is_active` (boolean) - 账户状态

    - `question_categories` - 题目分类表
      - `id` (uuid, primary key) - 分类ID
      - `name` (varchar) - 分类名称（记忆力/判断力/反应力）
      - `description` (text) - 分类描述
      - `icon` (varchar) - 图标标识
      - `display_order` (integer) - 显示顺序

    - `questions` - 题目表
      - `id` (uuid, primary key) - 题目ID
      - `category_id` (uuid) - 分类ID
      - `type` (varchar) - 题目类型（judgment/multiple_choice）
      - `question_text` (text) - 题目内容
      - `options` (jsonb) - 选项（JSON数组）
      - `correct_answer` (varchar) - 正确答案
      - `explanation` (text) - 解析内容
      - `image_url` (text) - 题目图片URL
      - `difficulty_level` (integer) - 难度等级（1-5）
      - `is_active` (boolean) - 是否启用

  2. Security
    - 启用所有表的RLS
    - 为认证用户添加适当的访问策略
    - 题目和分类表对所有用户只读
    - 用户数据表只能访问自己的数据
*/

-- 创建应用用户表
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username varchar(50) UNIQUE NOT NULL,
  full_name varchar(100),
  age integer CHECK (age >= 0 AND age <= 120),
  phone varchar(20),
  registration_date timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建题目分类表
CREATE TABLE IF NOT EXISTS question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL UNIQUE,
  description text,
  icon varchar(20),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 创建题目表
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES question_categories(id) ON DELETE SET NULL,
  type varchar(20) NOT NULL CHECK (type IN ('judgment', 'multiple_choice')),
  question_text text NOT NULL,
  options jsonb,
  correct_answer varchar(10) NOT NULL,
  explanation text NOT NULL,
  image_url text,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户表策略
CREATE POLICY "Users can view and update their own profile"
  ON app_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 题目分类表策略（所有用户可查看）
CREATE POLICY "Anyone can view question categories"
  ON question_categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- 题目表策略（所有用户可查看活跃题目）
CREATE POLICY "Anyone can view active questions"
  ON questions
  FOR SELECT
  TO public
  USING (is_active = true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username);
CREATE INDEX IF NOT EXISTS idx_app_users_active ON app_users(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);