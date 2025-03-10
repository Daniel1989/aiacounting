-- Essential initial data for tags table
-- This script inserts the most important tags with Chinese names
-- Assumes the tags table is empty

-- Expense Categories (cost)
INSERT INTO tags (name, icon, category) VALUES
-- Common Expense Categories
('餐饮', '餐饮', 'cost'),
('交通', '小车', 'cost'),
('购物', '购物', 'cost'),
('住房', '房租', 'cost'),
('水电', '水电', 'cost'),
('医疗', '医院', 'cost'),
('教育', '教育', 'cost'),
('娱乐', '娱乐', 'cost'),
('衣服', '衣服', 'cost'),
('电子产品', '电脑', 'cost'),
('旅行', '旅行', 'cost'),
('健身', '健身', 'cost'),
('宠物', '宠物', 'cost'),
('礼物', '礼物', 'cost'),

-- Food Subcategories
('外出就餐', '餐饮', 'cost'),
('水果', '水果', 'cost'),
('蔬菜', '蔬菜', 'cost'),
('饮料', '饮料', 'cost'),

-- Transportation Subcategories
('小车', '小车', 'cost'),
('出租车', '出租车', 'cost'),
('公交车', '公交车', 'cost'),
('火车', '火车', 'cost'),
('飞机', '飞机', 'cost'),

-- Income Categories (income)
('工资', '工资', 'income'),
('奖金', '奖金', 'income'),
('投资', '投资', 'income'),
('分红', '分红', 'income'),
('红包', '红包', 'income'),
('报销', '报销', 'income'),
('租金收入', '房租', 'income'),
('副业', '工作', 'income'),
('补助', '补助', 'income'); 