/*
  # 添加is_passed列到exam_records表

  1. 表更新
    - 在exam_records表中添加is_passed列
    - 设置默认值为false

  2. 函数修复
    - 修复calculate_user_exam_stats函数以正确使用is_passed列
    - 确保函数返回类型与实际查询结果匹配

  3. 数据更新
    - 根据分数计算现有记录的is_passed值（90分及以上为通过）
*/

-- 添加is_passed列到exam_records表
ALTER TABLE exam_records 
ADD COLUMN IF NOT EXISTS is_passed boolean DEFAULT false;

-- 更新现有记录的is_passed值（假设90分及以上为通过）
UPDATE exam_records 
SET is_passed = (score >= 90) 
WHERE completed_at IS NOT NULL;

-- 重新创建calculate_user_exam_stats函数
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