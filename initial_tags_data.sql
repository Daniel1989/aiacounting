-- Initial data for tags table
-- This script inserts default tags with Chinese names and Chinese icon names
-- Assumes the tags table is empty

-- Expense Categories (cost)
INSERT INTO tags (name, icon, category) VALUES
-- Food & Dining
('餐饮', '餐饮', 'cost'),
('外出就餐', '餐饮', 'cost'),
('杂货', '蔬菜', 'cost'),
('水果', '水果', 'cost'),
('蔬菜', '蔬菜', 'cost'),
('饮料', '饮料', 'cost'),
('冰淇淋', '冰淇淋', 'cost'),

-- Transportation
('交通', '小车', 'cost'),
('小车', '小车', 'cost'),
('出租车', '出租车', 'cost'),
('出租', '出租', 'cost'),
('公交车', '公交车', 'cost'),
('公共交通', '公交', 'cost'),
('火车', '火车', 'cost'),
('飞机', '飞机', 'cost'),
('加油', '加油', 'cost'),
('电动车', '电动车', 'cost'),

-- Shopping & Clothing
('购物', '购物', 'cost'),
('商场', '商场', 'cost'),
('服装', '衣服', 'cost'),
('衣服', '衣服', 'cost'),
('鞋子', '鞋子', 'cost'),
('牛仔裤', '牛仔裤', 'cost'),
('裤子', '裤子', 'cost'),
('包', '包', 'cost'),
('口红', '口红', 'cost'),
('玩具', '玩具', 'cost'),
('儿童玩具', '儿童玩具', 'cost'),

-- Housing & Utilities
('住房', '房租', 'cost'),
('房租', '房租', 'cost'),
('水电', '水电', 'cost'),
('电费', '电费', 'cost'),
('燃气', '燃气', 'cost'),
('沙发', '沙发', 'cost'),
('日用品', '日用品', 'cost'),

-- Electronics
('电子产品', '电脑', 'cost'),
('电脑', '电脑', 'cost'),
('笔记本', '笔记本', 'cost'),
('手机', '手机', 'cost'),
('工具', '工具', 'cost'),

-- Healthcare
('医疗', '医院', 'cost'),
('医院', '医院', 'cost'),
('病床', '病床', 'cost'),
('医生', '医生', 'cost'),
('药丸', '药丸', 'cost'),
('牙齿', '牙齿', 'cost'),
('健康', '健康', 'cost'),
('心电图', '心电图', 'cost'),
('针', '针', 'cost'),

-- Education
('教育', '教育', 'cost'),
('书籍', '书籍', 'cost'),
('书本', '书本', 'cost'),
('学校', '学校', 'cost'),
('老师', '老师', 'cost'),
('练习册', '练习册', 'cost'),

-- Entertainment & Leisure
('娱乐', '娱乐', 'cost'),
('电影', '电影', 'cost'),
('电影院', '电影院', 'cost'),
('音乐', '音乐', 'cost'),
('游戏', '游戏', 'cost'),
('派对', '派对', 'cost'),
('票', '票', 'cost'),
('订阅', '票', 'cost'),

-- Travel & Fitness
('旅行', '旅行', 'cost'),
('旅游', '旅游', 'cost'),
('游轮', '游轮', 'cost'),
('健身', '健身', 'cost'),
('肌肉', '肌肉', 'cost'),
('游泳', '游泳', 'cost'),
('篮球', '篮球', 'cost'),

-- Pets & Gifts
('宠物', '宠物', 'cost'),
('礼物', '礼物', 'cost'),

-- Other Expenses
('违章', '违章', 'cost'),
('婴儿车', '婴儿车', 'cost'),
('奶瓶', '奶瓶', 'cost'),

-- Income Categories (income)
('工资', '工资', 'income'),
('奖金', '奖金', 'income'),
('投资', '投资', 'income'),
('分红', '分红', 'income'),
('礼金', '红包', 'income'),
('红包', '红包', 'income'),
('退款', '报销', 'income'),
('报销', '报销', 'income'),
('租金收入', '房租', 'income'),
('自由职业', '工作', 'income'),
('工作', '工作', 'income'),
('副业', '工作', 'income'),
('津贴', '补助', 'income'),
('补助', '补助', 'income'),
('股票', '股票', 'income'),
('银行', '银行', 'income'),
('借款', '借款', 'income'),
('钱包', '钱包', 'income'); 