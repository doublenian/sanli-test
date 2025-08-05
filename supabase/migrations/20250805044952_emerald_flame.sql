/*
  # 创建训练题目表

  1. 新建表
    - `training_questions` - 存储训练题目数据
      - `id` (uuid, primary key)
      - `training_type` (训练类型: memory, judgment, reaction) 
      - `question_data` (jsonb, 题目数据)
      - `display_order` (显示顺序)
      - `is_active` (是否激活)
      - `created_at`, `updated_at` (时间戳)

  2. 安全策略
    - 允许所有人查看激活的训练题目
    - 管理员可以管理题目

  3. 初始数据
    - 插入记忆力、判断力、反应力训练的题目数据
*/

-- 创建训练题目表
CREATE TABLE IF NOT EXISTS training_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_type varchar(20) NOT NULL CHECK (training_type IN ('memory', 'judgment', 'reaction')),
  question_data jsonb NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用行级安全
ALTER TABLE training_questions ENABLE ROW LEVEL SECURITY;

-- 创建策略 - 所有人可以查看激活的训练题目
CREATE POLICY "Anyone can view active training questions"
  ON training_questions
  FOR SELECT
  TO public
  USING (is_active = true);

-- 创建索引
CREATE INDEX idx_training_questions_type ON training_questions(training_type);
CREATE INDEX idx_training_questions_active ON training_questions(is_active);

-- 插入记忆力训练数据
INSERT INTO training_questions (training_type, question_data, display_order) VALUES
('memory', '{
  "items": [
    {"id": 1, "name": "苹果", "emoji": "🍎"},
    {"id": 2, "name": "钥匙", "emoji": "🔑"},
    {"id": 3, "name": "帽子", "emoji": "👒"},
    {"id": 4, "name": "手表", "emoji": "⌚"},
    {"id": 5, "name": "眼镜", "emoji": "👓"},
    {"id": 6, "name": "手机", "emoji": "📱"},
    {"id": 7, "name": "钱包", "emoji": "👛"},
    {"id": 8, "name": "雨伞", "emoji": "☂️"},
    {"id": 9, "name": "书本", "emoji": "📚"},
    {"id": 10, "name": "水杯", "emoji": "🥤"}
  ],
  "config": {
    "memorizeTime": 10,
    "distractionTime": 5,
    "itemsToRemember": 4,
    "correctPoints": 25,
    "incorrectPenalty": 10
  }
}', 1),

-- 插入判断力训练数据
('judgment', '{
  "scenarios": [
    {
      "id": 1,
      "scenario": "前方出现校车停车上下学生",
      "image": "https://images.pexels.com/photos/159558/yellow-school-bus-driving-children-159558.jpeg",
      "question": "此时您应该怎么做？",
      "options": [
        "鸣笛催促校车快速通过",
        "减速慢行，保持安全距离", 
        "加速从左侧超越校车",
        "紧跟校车后方通过"
      ],
      "correctAnswer": 1,
      "explanation": "遇到校车上下学生时，应当减速慢行并保持安全距离，确保学生安全。严禁鸣笛催促或强行超越。"
    },
    {
      "id": 2,
      "scenario": "雨天行驶，前方车辆急刹车",
      "image": "https://images.pexels.com/photos/210126/pexels-photo-210126.jpeg",
      "question": "在这种情况下，正确的做法是？",
      "options": [
        "立即急刹车跟着停下",
        "轻踩制动，逐渐减速",
        "向左变道避开前车",
        "加速从右侧超越"
      ],
      "correctAnswer": 1,
      "explanation": "雨天路面湿滑，应当轻踩制动逐渐减速，避免急刹车导致车辆失控或追尾事故。"
    },
    {
      "id": 3,
      "scenario": "高速公路上发现前方有事故",
      "image": "https://images.pexels.com/photos/2365457/pexels-photo-2365457.jpeg",
      "question": "发现前方有交通事故时应该？",
      "options": [
        "立即停车查看情况",
        "减速慢行，注意避让",
        "鸣笛提醒其他车辆",
        "拍照发朋友圈"
      ],
      "correctAnswer": 1,
      "explanation": "发现前方事故时应减速慢行，注意避让，确保自身安全。不应停车围观或做其他妨碍交通的行为。"
    },
    {
      "id": 4,
      "scenario": "夜间会车遇到远光灯照射",
      "image": "https://images.pexels.com/photos/210199/pexels-photo-210199.jpeg",
      "question": "被对方远光灯照射影响视线时应该？",
      "options": [
        "用远光灯回射对方",
        "减速慢行，必要时停车避让",
        "加速快速通过会车点",
        "紧急制动立即停车"
      ],
      "correctAnswer": 1,
      "explanation": "遇到远光灯照射时应减速慢行，必要时可停车避让，等待视线恢复后再继续行驶。不应用远光灯回射。"
    },
    {
      "id": 5,
      "scenario": "城市道路遇到救护车鸣笛",
      "image": "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg",
      "question": "听到救护车鸣笛声应该？",
      "options": [
        "保持原车道正常行驶",
        "立即靠边停车让行",
        "加速抢在救护车前通过",
        "跟在救护车后方行驶"
      ],
      "correctAnswer": 1,
      "explanation": "听到救护车等特种车辆鸣笛时，应立即靠边停车让行，为抢救生命让出通道。"
    }
  ],
  "config": {
    "thinkingTime": 60,
    "pointsPerQuestion": 20
  }
}', 1),

-- 插入反应力训练数据
('reaction', '{
  "tests": [
    {"id": 1, "type": "brake", "color": "#DC2626", "instruction": "前方障碍物！立即制动", "delay": 2000},
    {"id": 2, "type": "ignore", "color": "#16A34A", "instruction": "正常行驶信号", "delay": 1500},
    {"id": 3, "type": "brake", "color": "#DC2626", "instruction": "紧急情况！快速制动", "delay": 3000},
    {"id": 4, "type": "avoid", "color": "#EA580C", "instruction": "左侧变道避让", "delay": 2500},
    {"id": 5, "type": "brake", "color": "#DC2626", "instruction": "行人横穿！紧急制动", "delay": 1800},
    {"id": 6, "type": "ignore", "color": "#16A34A", "instruction": "绿灯正常通行", "delay": 2200},
    {"id": 7, "type": "avoid", "color": "#EA580C", "instruction": "右侧障碍物避让", "delay": 1600},
    {"id": 8, "type": "brake", "color": "#DC2626", "instruction": "前车急停！立即刹车", "delay": 2800}
  ],
  "config": {
    "countdownTime": 3,
    "actionTypes": {
      "brake": {"color": "#DC2626", "label": "制动"},
      "avoid": {"color": "#EA580C", "label": "避让"},
      "ignore": {"color": "#16A34A", "label": "正常行驶"}
    }
  }
}', 1);