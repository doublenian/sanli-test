-- Fix the calculate_user_exam_stats function
-- 1. Ensure exam_records table has correct column structure  
-- 2. Fix total_study_time type from integer to bigint

-- First ensure exam_records table has is_passed column
ALTER TABLE exam_records 
ADD COLUMN IF NOT EXISTS is_passed boolean DEFAULT false;

-- Then fix the function definition
CREATE OR REPLACE FUNCTION calculate_user_exam_stats(p_user_id uuid)
RETURNS TABLE (
  total_exams bigint,
  total_passed bigint,
  highest_score integer,
  average_score numeric,
  total_study_time bigint,  -- Changed from integer to bigint
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