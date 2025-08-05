/*
  # 数据库函数和触发器

  1. Functions
    - `update_study_progress()` - 更新学习进度函数
    - `calculate_user_stats()` - 计算用户统计信息函数
    - `get_random_questions()` - 获取随机题目函数
    - `update_wrong_question_status()` - 更新错题状态函数

  2. Triggers
    - 自动更新学习进度
    - 自动计算正确率和完成率
    - 更新时间戳
*/

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建更新学习进度函数
CREATE OR REPLACE FUNCTION update_study_progress(
  p_user_id uuid,
  p_category_id uuid,
  p_is_correct boolean
)
RETURNS void AS $$
DECLARE
  v_total_questions integer;
  v_completed_questions integer;
  v_correct_questions integer;
BEGIN
  -- 获取该分类的总题数
  SELECT COUNT(*) INTO v_total_questions
  FROM questions 
  WHERE category_id = p_category_id AND is_active = true;
  
  -- 获取用户在该分类的完成题数和正确题数
  SELECT 
    COUNT(DISTINCT uqa.question_id),
    COUNT(DISTINCT CASE WHEN uqa.is_correct THEN uqa.question_id END)
  INTO v_completed_questions, v_correct_questions
  FROM user_question_answers uqa
  JOIN questions q ON uqa.question_id = q.id
  WHERE uqa.user_id = p_user_id AND q.category_id = p_category_id;
  
  -- 更新或插入学习进度
  INSERT INTO user_study_progress (
    user_id, 
    category_id, 
    total_questions, 
    completed_questions, 
    correct_questions,
    completion_rate,
    accuracy_rate,
    last_study_date
  )
  VALUES (
    p_user_id,
    p_category_id,
    v_total_questions,
    v_completed_questions,
    v_correct_questions,
    CASE WHEN v_total_questions > 0 THEN (v_completed_questions::numeric / v_total_questions * 100) ELSE 0 END,
    CASE WHEN v_completed_questions > 0 THEN (v_correct_questions::numeric / v_completed_questions * 100) ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id, category_id)
  DO UPDATE SET
    total_questions = EXCLUDED.total_questions,
    completed_questions = EXCLUDED.completed_questions,
    correct_questions = EXCLUDED.correct_questions,
    completion_rate = EXCLUDED.completion_rate,
    accuracy_rate = EXCLUDED.accuracy_rate,
    last_study_date = EXCLUDED.last_study_date,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- 创建错题管理函数
CREATE OR REPLACE FUNCTION manage_wrong_question(
  p_user_id uuid,
  p_question_id uuid,
  p_is_correct boolean
)
RETURNS void AS $$
BEGIN
  IF p_is_correct THEN
    -- 如果答对了，更新为已掌握
    UPDATE user_wrong_questions 
    SET is_mastered = true, updated_at = now()
    WHERE user_id = p_user_id AND question_id = p_question_id;
  ELSE
    -- 如果答错了，插入或更新错题记录
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
$$ LANGUAGE plpgsql;

-- 创建获取随机题目函数
CREATE OR REPLACE FUNCTION get_random_questions(
  p_count integer DEFAULT 20,
  p_category_id uuid DEFAULT NULL,
  p_exclude_mastered boolean DEFAULT false,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  category_id uuid,
  type varchar,
  question_text text,
  options jsonb,
  correct_answer varchar,
  explanation text,
  image_url text,
  difficulty_level integer
) AS $$
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
  LEFT JOIN user_wrong_questions uwq ON (q.id = uwq.question_id AND uwq.user_id = p_user_id)
  WHERE q.is_active = true
    AND (p_category_id IS NULL OR q.category_id = p_category_id)
    AND (NOT p_exclude_mastered OR uwq.is_mastered IS NOT true OR uwq.id IS NULL)
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql;

-- 创建计算用户统计信息函数
CREATE OR REPLACE FUNCTION calculate_user_exam_stats(p_user_id uuid)
RETURNS TABLE (
  total_exams bigint,
  total_passed bigint,
  highest_score integer,
  average_score numeric,
  total_study_time bigint,
  pass_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_exams,
    COUNT(*) FILTER (WHERE is_passed = true) as total_passed,
    COALESCE(MAX(score), 0) as highest_score,
    COALESCE(AVG(score), 0) as average_score,
    COALESCE(SUM(time_spent), 0) as total_study_time,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE is_passed = true)::numeric / COUNT(*) * 100)
      ELSE 0
    END as pass_rate
  FROM exam_records
  WHERE user_id = p_user_id AND completed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
-- 用户表更新时间触发器
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 题目表更新时间触发器
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 错题表更新时间触发器
CREATE TRIGGER update_wrong_questions_updated_at
  BEFORE UPDATE ON user_wrong_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 学习进度表更新时间触发器
CREATE TRIGGER update_study_progress_updated_at
  BEFORE UPDATE ON user_study_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 用户设置表更新时间触发器
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();