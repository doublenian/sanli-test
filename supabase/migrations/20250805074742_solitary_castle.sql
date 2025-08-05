/*
  # 修复calculate_user_exam_stats函数和is_passed列

  1. 添加缺失的is_passed列
  2. 删除现有函数
  3. 重新创建函数
  4. 更新现有数据
*/

-- 添加is_passed列（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exam_records' AND column_name = 'is_passed'
  ) THEN
    ALTER TABLE exam_records ADD COLUMN is_passed boolean DEFAULT false;
  END IF;
END $$;

-- 删除现有函数
DROP FUNCTION IF EXISTS calculate_user_exam_stats(uuid);

-- 重新创建函数
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

-- 更新现有数据的is_passed值
UPDATE exam_records 
SET is_passed = (score >= 90) 
WHERE is_passed IS NULL OR is_passed = false;