/*
# 迁移题库数据到数据库

本迁移将本地questionBank数据迁移到Supabase数据库，包括：

1. 新增数据
   - 在question_categories表中创建必要的分类
   - 将所有本地题目数据插入到questions表

2. 数据映射
   - 将本地分类('memory', 'judgment', 'reaction')映射到数据库分类
   - 转换题目格式以适配数据库结构
   - 处理选择题的options字段(JSON格式)

3. 安全措施
   - 使用IF NOT EXISTS避免重复插入
   - 保持现有数据完整性
*/

-- 插入题目分类（如果不存在）
INSERT INTO question_categories (name, description, icon, display_order, is_active) 
VALUES 
  ('记忆力', '记忆力相关题目', '🧠', 1, true),
  ('判断力', '判断力相关题目', '👁️', 2, true),
  ('反应力', '反应力相关题目', '⚡', 3, true)
ON CONFLICT (name) DO NOTHING;

-- 获取分类ID变量
DO $$
DECLARE
  memory_category_id uuid;
  judgment_category_id uuid;
  reaction_category_id uuid;
BEGIN
  -- 获取分类ID
  SELECT id INTO memory_category_id FROM question_categories WHERE name = '记忆力';
  SELECT id INTO judgment_category_id FROM question_categories WHERE name = '判断力';
  SELECT id INTO reaction_category_id FROM question_categories WHERE name = '反应力';

  -- 插入判断题
  INSERT INTO questions (id, category_id, type, question_text, correct_answer, explanation, difficulty_level, is_active) VALUES
    ('j001', judgment_category_id, 'judgment', '将转向灯开关向下拉，右转向灯会亮起。', 'false', '汽车转向灯的操作口诀是"上右下左"。将开关向上拨动是开启右转向灯，向下拨动是开启左转向灯。', 1, true),
    ('j002', judgment_category_id, 'judgment', '机动车在高速公路上行驶，遇有雾、雨、雪、沙尘、冰雹等低能见度气象条件时，应当开启雾灯、近光灯、示廓灯和前后位灯。', 'true', '在低能见度天气条件下，开启相应灯光是为了提高自身车辆的可见性，确保行车安全。', 1, true),
    ('j003', judgment_category_id, 'judgment', '驾驶机动车在道路上超车时，应当提前开启左转向灯。', 'true', '超车时必须提前开启左转向灯，告知其他车辆您的行驶意图，确保安全超车。', 1, true),
    ('j004', memory_category_id, 'judgment', '机动车驾驶证的有效期为6年、10年、20年和长期。', 'false', '机动车驾驶证的有效期分为6年、10年和长期三种，没有20年有效期。', 2, true),
    ('j005', reaction_category_id, 'judgment', '夜间会车应当在距相对方向来车150米以外改用近光灯。', 'true', '夜间会车时，应在距离对向来车150米以外将远光灯改为近光灯，避免眩目影响对方驾驶员视线。', 1, true),
    ('j006', judgment_category_id, 'judgment', '驾驶机动车通过交叉路口要遵守交通信号灯。', 'true', '通过交叉路口时必须遵守交通信号灯指示，这是基本的交通规则。', 1, true),
    ('j007', memory_category_id, 'judgment', '醉酒驾驶机动车的，由公安机关交通管理部门约束至酒醒，吊销机动车驾驶证，依法追究刑事责任，5年内不得重新取得机动车驾驶证。', 'true', '醉酒驾驶是严重的违法行为，会被吊销驾驶证并追究刑事责任，5年内不得重新申领。', 2, true),
    ('j008', reaction_category_id, 'judgment', '行车中遇到对向来车占道行驶，应当紧急制动迫使对方让道。', 'false', '遇到对向来车占道时，应主动减速避让，而不是紧急制动迫使对方让道，确保行车安全。', 2, true),
    ('j009', memory_category_id, 'judgment', '70周岁以上的机动车驾驶人，应当每年进行一次身体检查。', 'true', '根据《机动车驾驶证申领和使用规定》，70周岁以上驾驶人应当每年进行一次身体检查。', 1, true),
    ('j010', judgment_category_id, 'judgment', '雾天行车时，应当开启雾灯、近光灯、示廓灯和危险报警闪光灯。', 'false', '雾天行车应开启雾灯、近光灯、示廓灯和前后位灯，但不需要开启危险报警闪光灯，除非车辆发生故障。', 2, true),
    ('j011', reaction_category_id, 'judgment', '驾驶机动车在雨天路面行驶时，应当降低行驶速度。', 'true', '雨天路面湿滑，摩擦力减小，应当降低行驶速度，保持安全车距。', 1, true),
    ('j012', judgment_category_id, 'judgment', '机动车通过没有交通信号灯控制也没有交通警察指挥的交叉路口，相对方向行驶的右转弯机动车让左转弯机动车先行。', 'false', '在没有信号灯和交警指挥的交叉路口，相对方向行驶的左转弯机动车让右转弯机动车先行。', 2, true),
    ('j013', memory_category_id, 'judgment', '申请增加轻型牵引挂车准驾车型的，已取得驾驶小型汽车准驾车型资格1年以上，且在申请前最近1个记分周期内没有记满12分记录。', 'false', '申请增加轻型牵引挂车准驾车型的，需要已取得小型汽车准驾车型资格3年以上，且在申请前最近连续3个记分周期内没有记满12分记录。', 3, true),
    ('j014', reaction_category_id, 'judgment', '车辆在山区道路行车下陡坡时，不得超车。', 'true', '在山区道路下陡坡时，由于视线受限且制动距离增加，不得超车以确保安全。', 2, true),
    ('j015', judgment_category_id, 'judgment', '驾驶机动车变更车道时，应当提前开启转向灯，注意观察，确保安全。', 'true', '变更车道是一项需要谨慎操作的驾驶行为，必须提前开启转向灯并仔细观察，确保安全。', 1, true)
  ON CONFLICT (id) DO NOTHING;

  -- 插入选择题
  INSERT INTO questions (id, category_id, type, question_text, options, correct_answer, explanation, image_url, difficulty_level, is_active) VALUES
    ('m001', judgment_category_id, 'multiple_choice', '这个路口允许车辆怎样行驶？', '["A. 向左转弯", "B. 直行", "C. 向右转弯", "D. 掉头"]'::jsonb, '1', '根据路口标志，此处只允许直行，禁止转弯和掉头。', 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg', 2, true),
    ('m002', memory_category_id, 'multiple_choice', '机动车在高速公路上行驶，车速超过每小时100公里时，应当与同车道前车保持多少米以上的距离？', '["A. 50米", "B. 80米", "C. 100米", "D. 120米"]'::jsonb, '2', '高速公路上车速超过100km/h时，应与前车保持100米以上的安全距离。', null, 2, true),
    ('m003', reaction_category_id, 'multiple_choice', '驾驶机动车遇到前方车辆停车排队等候或者缓慢行驶时，应当怎样做？', '["A. 借道超车", "B. 占用对面车道", "C. 穿插等候的车辆", "D. 依次排队"]'::jsonb, '3', '遇到前方车辆排队时，应当依次排队等候，不得借道超车或穿插。', null, 1, true),
    ('m004', judgment_category_id, 'multiple_choice', '这个标志是何含义？', '["A. 禁止通行", "B. 注意危险", "C. 减速慢行", "D. 傍山险路"]'::jsonb, '3', '此标志表示傍山险路，提醒驾驶员注意山区道路的危险，小心驾驶。', 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg', 2, true),
    ('m005', memory_category_id, 'multiple_choice', '申请小型汽车驾驶证的人员年龄条件是什么？', '["A. 18周岁以上", "B. 18周岁以上70周岁以下", "C. 20周岁以上60周岁以下", "D. 21周岁以上50周岁以下"]'::jsonb, '1', '申请小型汽车驾驶证的年龄条件是18周岁以上70周岁以下。', null, 1, true),
    ('m006', reaction_category_id, 'multiple_choice', '在道路上发生交通事故，车辆驾驶人应当立即停车，保护现场；造成人身伤亡的，车辆驾驶人应当立即抢救受伤人员，并迅速报告执勤的交通警察或者公安机关交通管理部门。因抢救受伤人员变动现场的，应当：', '["A. 标明位置", "B. 疏散人群", "C. 保护财产", "D. 清理现场"]'::jsonb, '0', '因抢救受伤人员需要变动现场时，应当标明位置，以便事故处理和责任认定。', null, 3, true),
    ('m007', judgment_category_id, 'multiple_choice', '这个标志是何含义？', '["A. 限制高度", "B. 限制宽度", "C. 限制长度", "D. 限制质量"]'::jsonb, '0', '此标志表示限制车辆高度，车辆高度不得超过标志标明的数值。', 'https://images.pexels.com/photos/280018/pexels-photo-280018.jpeg', 2, true),
    ('m008', memory_category_id, 'multiple_choice', '机动车驾驶证被依法扣押、扣留、暂扣期间能否申请补发？', '["A. 可以申请", "B. 扣留期间可以临时申请", "C. 不得申请补发", "D. 可以申请临时驾驶证"]'::jsonb, '2', '驾驶证被依法扣押、扣留或暂扣期间，不得申请补发。', null, 2, true),
    ('m009', judgment_category_id, 'multiple_choice', '驾驶机动车在高速公路遇到能见度低于50米的气象条件时，车速不得超过每小时多少公里？', '["A. 60公里", "B. 40公里", "C. 20公里", "D. 10公里"]'::jsonb, '2', '能见度低于50米时，车速不得超过每小时20公里，并从最近的出口尽快驶离高速公路。', null, 2, true),
    ('m010', memory_category_id, 'multiple_choice', '公安机关交通管理部门对累积记分达到规定分值的驾驶人，扣留机动车驾驶证，对其进行什么？', '["A. 道路交通安全法律、法规教育", "B. 道德教育", "C. 安全驾驶技能培训", "D. 都不对"]'::jsonb, '0', '对累积记分达到规定分值的驾驶人，应当扣留驾驶证，进行道路交通安全法律、法规教育。', null, 2, true),
    ('m011', reaction_category_id, 'multiple_choice', '驾驶机动车行经人行横道，遇行人正在通过时，应当怎样做？', '["A. 停车让行", "B. 绕行通过", "C. 持续鸣喇叭通过", "D. 加速通过"]'::jsonb, '0', '行经人行横道遇行人通过时，必须停车让行，确保行人安全。', null, 1, true),
    ('m012', judgment_category_id, 'multiple_choice', '这个标志是何含义？', '["A. 注意行人", "B. 人行横道", "C. 注意儿童", "D. 学校区域"]'::jsonb, '2', '此标志表示注意儿童，提醒驾驶员在此路段要特别注意儿童安全。', 'https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg', 2, true),
    ('m013', memory_category_id, 'multiple_choice', '驾驶证记载的驾驶人信息发生变化的，应当在多长时间内申请换证？', '["A. 60日", "B. 50日", "C. 40日", "D. 30日"]'::jsonb, '3', '驾驶证记载的驾驶人信息发生变化的，应当在30日内申请换证。', null, 2, true),
    ('m014', reaction_category_id, 'multiple_choice', '在高速公路上行驶，遇有雾、雨、雪、沙尘、冰雹等低能见度气象条件下，能见度在50米以下时，以下做法正确的是什么？', '["A. 加速驶离高速公路", "B. 在应急车道上停车等候", "C. 可以继续行驶，但车速不得超过每小时40公里", "D. 尽快从最近的出口驶离高速公路"]'::jsonb, '3', '能见度在50米以下时，应当尽快从最近的出口驶离高速公路，这是最安全的做法。', null, 3, true)
  ON CONFLICT (id) DO NOTHING;

END $$;