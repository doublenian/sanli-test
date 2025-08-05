/*
# 执行数据库修复

修复exam_records表缺失的is_passed列和相关函数

1. 添加缺失的列
   - `is_passed` (boolean) - 考试是否通过标识

2. 修复函数
   - 重新创建calculate_user_exam_stats函数
   - 确保返回类型与实际查询匹配

3. 更新现有数据
   - 根据分数自动设置is_passed值
*/

-- 首先确保 exam_records 表有 is_passed 列
ALTER TABLE exam_records 
ADD COLUMN IF NOT EXISTS is_passed boolean DEFAULT false;

-- 更新现有记录的is_passed值（90分及以上为通过）
UPDATE exam_records 
SET is_passed = (score >= 90) 
WHERE is_passed IS NULL OR is_passed = false;

-- 然后修复函数定义
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