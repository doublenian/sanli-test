/*
  # 修复exam_records表缺失is_passed列

  1. 表结构修复
    - 在exam_records表中添加is_passed列
    - 设置默认值为false
    - 更新现有记录的is_passed值（基于分数）

  2. 函数修复
    - 重新创建calculate_user_exam_stats函数
    - 确保返回类型与实际查询结果匹配
    - 正确引用is_passed列
*/

-- 1. 添加is_passed列到exam_records表
ALTER TABLE exam_records 
ADD COLUMN IF NOT EXISTS is_passed boolean DEFAULT false;

-- 2. 更新现有记录的is_passed值（假设90分及以上为通过）
UPDATE exam_records 
SET is_passed = (score >= 90) 
WHERE completed_at IS NOT NULL;

-- 3. 创建或替换calculate_user_exam_stats函数
CREATE OR REPLACE FUNCTION calculate_user_exam_stats(p_user_id uuid)
RETURNS TABLE (
  total_exams bigint,
  total_passed bigint,
  highest_score integer,
  average_score numeric,
  total_study_time bigint,
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