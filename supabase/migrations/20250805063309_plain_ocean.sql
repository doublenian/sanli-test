/*
  # 创建测试用户账户

  1. 创建测试用户
    - 邮箱: test@example.com
    - 密码: 123456
    - 包含对应的app_users记录和默认设置

  2. 安全说明
    - 仅用于开发测试
    - 生产环境应删除此用户
*/

-- 创建测试用户的app_users记录
INSERT INTO app_users (
  id,
  username,
  full_name,
  age,
  phone,
  registration_date,
  last_active,
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'testuser',
  '测试用户',
  25,
  '13800138000',
  CURRENT_DATE,
  now(),
  true
) ON CONFLICT (id) DO NOTHING;

-- 创建用户默认设置
INSERT INTO user_settings (
  user_id,
  font_size,
  voice_enabled,
  language,
  theme,
  auto_play_voice,
  show_hints
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'large',
  true,
  'chinese',
  'light',
  true,
  true
) ON CONFLICT (user_id) DO NOTHING;

-- 添加一些示例学习进度数据
INSERT INTO user_study_progress (
  user_id,
  category_id,
  total_questions,
  completed_questions,
  correct_questions,
  completion_rate,
  accuracy_rate
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  id,
  (SELECT COUNT(*) FROM questions WHERE category_id = qc.id AND is_active = true),
  CASE 
    WHEN qc.name = '记忆力测试' THEN 45
    WHEN qc.name = '判断力测试' THEN 78
    ELSE 32
  END,
  CASE 
    WHEN qc.name = '记忆力测试' THEN 38
    WHEN qc.name = '判断力测试' THEN 71
    ELSE 28
  END,
  CASE 
    WHEN qc.name = '记忆力测试' THEN 60.00
    WHEN qc.name = '判断力测试' THEN 75.00
    ELSE 45.00
  END,
  CASE 
    WHEN qc.name = '记忆力测试' THEN 84.44
    WHEN qc.name = '判断力测试' THEN 91.03
    ELSE 87.50
  END
FROM question_categories qc
WHERE qc.is_active = true
ON CONFLICT (user_id, category_id) DO NOTHING;

-- 添加一些考试记录
INSERT INTO exam_records (
  user_id,
  exam_type,
  total_questions,
  correct_answers,
  score,
  time_spent,
  is_passed,
  started_at,
  completed_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'mock_exam',
  20,
  17,
  85,
  1200,
  true,
  now() - interval '2 days',
  now() - interval '2 days' + interval '20 minutes'
),
(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'mock_exam',
  20,
  19,
  95,
  1080,
  true,
  now() - interval '1 day',
  now() - interval '1 day' + interval '18 minutes'
),
(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'mock_exam',
  20,
  16,
  80,
  1320,
  true,
  now() - interval '3 hours',
  now() - interval '3 hours' + interval '22 minutes'
);

-- 添加一些错题记录
INSERT INTO user_wrong_questions (
  user_id,
  question_id,
  wrong_count,
  first_wrong_at,
  last_wrong_at,
  is_mastered
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  id,
  CASE WHEN random() < 0.3 THEN 1 ELSE 2 END,
  now() - interval '5 days',
  now() - interval '1 day',
  random() < 0.2
FROM questions 
WHERE is_active = true 
ORDER BY random() 
LIMIT 15
ON CONFLICT (user_id, question_id) DO NOTHING;

-- 添加一些训练记录
INSERT INTO training_records (
  user_id,
  training_type,
  score,
  max_score,
  duration,
  details,
  completed_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'memory',
  850,
  1000,
  300,
  '{"level": 5, "sequences_completed": 17, "accuracy": 85.0}',
  now() - interval '1 day'
),
(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'judgment',
  920,
  1000,
  240,
  '{"correct_judgments": 23, "total_judgments": 25, "accuracy": 92.0}',
  now() - interval '2 days'
),
(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'reaction',
  780,
  1000,
  180,
  '{"average_reaction_time": 245, "best_time": 189, "accuracy": 78.0}',
  now() - interval '3 days'
);