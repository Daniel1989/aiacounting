-- Complete SQL script to update the tags table for icon handling
-- This script will:
-- 1. Create a backup of the current tags table
-- 2. Update the icon column to use Chinese tag names for icon lookup
-- 3. Insert default tags if they don't exist

-- Step 1: Create a backup of the current tags table
CREATE TABLE IF NOT EXISTS tags_backup AS SELECT * FROM tags;

-- Step 2: Add a comment to clarify the new meaning of the icon column
COMMENT ON COLUMN tags.icon IS 'The name of the icon file (without extension) in the public/icons/tags directory - using Chinese names';

-- Step 3: Create a function to generate the full icon path
CREATE OR REPLACE FUNCTION get_tag_icon_path(tag_name TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN 'tags/' || tag_name;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a function to insert tags if they don't exist
CREATE OR REPLACE FUNCTION insert_tag_if_not_exists(
  p_name TEXT,
  p_icon TEXT,
  p_category TEXT
) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tags WHERE name = p_name AND category = p_category) THEN
    INSERT INTO tags (name, icon, category)
    VALUES (p_name, p_icon, p_category);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update existing tags with appropriate icons (using Chinese icon names)

-- Transportation
UPDATE tags SET icon = '婴儿车' WHERE name = 'Baby Stroller' OR name = '婴儿车';
UPDATE tags SET icon = '公交车' WHERE name = 'Bus' OR name = '公交车';
UPDATE tags SET icon = '出租车' WHERE name = 'Taxi' OR name = '出租车';
UPDATE tags SET icon = '电动车' WHERE name = 'Electric Vehicle' OR name = '电动车';
UPDATE tags SET icon = '飞机' WHERE name = 'Airplane' OR name = '飞机';
UPDATE tags SET icon = '公交' WHERE name = 'Public Transport' OR name = '公共交通';
UPDATE tags SET icon = '加油' WHERE name = 'Fuel' OR name = '加油';
UPDATE tags SET icon = '救护车' WHERE name = 'Towing' OR name = '救护车';
UPDATE tags SET icon = '出租' WHERE name = 'Cab' OR name = '出租';
UPDATE tags SET icon = '火车' WHERE name = 'Train' OR name = '火车';
UPDATE tags SET icon = '小车' WHERE name = 'Car' OR name = '小车';
UPDATE tags SET icon = '婴儿车' WHERE name = 'Baby Car' OR name = '婴儿车';
UPDATE tags SET icon = '游轮' WHERE name = 'Cruise' OR name = '游轮';

-- Food & Drink
UPDATE tags SET icon = '餐饮' WHERE name = 'Food' OR name = '食物';
UPDATE tags SET icon = '餐饮' WHERE name = 'Dining' OR name = '餐饮';
UPDATE tags SET icon = '水果' WHERE name = 'Fruits' OR name = '水果';
UPDATE tags SET icon = '冰淇淋' WHERE name = 'Ice Cream' OR name = '冰淇淋';
UPDATE tags SET icon = '蔬菜' WHERE name = 'Vegetables' OR name = '蔬菜';
UPDATE tags SET icon = '饮料' WHERE name = 'Beverages' OR name = '饮料';

-- Shopping & Clothing
UPDATE tags SET icon = '包' WHERE name = 'Bag' OR name = '包';
UPDATE tags SET icon = '衣服' WHERE name = 'Clothes' OR name = '衣服';
UPDATE tags SET icon = '牛仔裤' WHERE name = 'Jeans' OR name = '牛仔裤';
UPDATE tags SET icon = '口红' WHERE name = 'Cosmetics' OR name = '口红';
UPDATE tags SET icon = '裤子' WHERE name = 'Pants' OR name = '裤子';
UPDATE tags SET icon = '礼物' WHERE name = 'Gift' OR name = '礼物';
UPDATE tags SET icon = '购物' WHERE name = 'Shopping' OR name = '购物';
UPDATE tags SET icon = '商场' WHERE name = 'Mall' OR name = '商场';
UPDATE tags SET icon = '鞋子' WHERE name = 'Shoes' OR name = '鞋子';
UPDATE tags SET icon = '玩具' WHERE name = 'Toys' OR name = '玩具';
UPDATE tags SET icon = '衣服' WHERE name = 'Clothing' OR name = '衣服';

-- Home & Living
UPDATE tags SET icon = '电脑' WHERE name = 'Computer' OR name = '电脑';
UPDATE tags SET icon = '房租' WHERE name = 'Rent' OR name = '房租';
UPDATE tags SET icon = '笔记本' WHERE name = 'Laptop' OR name = '笔记本';
UPDATE tags SET icon = '手机' WHERE name = 'Phone' OR name = '手机';
UPDATE tags SET icon = '日用品' WHERE name = 'Daily Necessities' OR name = '日用品';
UPDATE tags SET icon = '沙发' WHERE name = 'Furniture' OR name = '沙发';
UPDATE tags SET icon = '水电' WHERE name = 'Utilities' OR name = '水电';
UPDATE tags SET icon = '工具' WHERE name = 'Tools' OR name = '工具';

-- Health & Medical
UPDATE tags SET icon = '病床' WHERE name = 'Hospital Bed' OR name = '病床';
UPDATE tags SET icon = '健康' WHERE name = 'Health' OR name = '健康';
UPDATE tags SET icon = '心电图' WHERE name = 'Medical Exam' OR name = '心电图';
UPDATE tags SET icon = '牙齿' WHERE name = 'Dental' OR name = '牙齿';
UPDATE tags SET icon = '药丸' WHERE name = 'Medicine' OR name = '药丸';
UPDATE tags SET icon = '医生' WHERE name = 'Doctor' OR name = '医生';
UPDATE tags SET icon = '医院' WHERE name = 'Hospital' OR name = '医院';
UPDATE tags SET icon = '针' WHERE name = 'Acupuncture' OR name = '针';

-- Education & Work
UPDATE tags SET icon = '书籍' WHERE name = 'Books' OR name = '书籍';
UPDATE tags SET icon = '教育' WHERE name = 'Education' OR name = '教育';
UPDATE tags SET icon = '工作' WHERE name = 'Work' OR name = '工作';
UPDATE tags SET icon = '老师' WHERE name = 'Teacher' OR name = '老师';
UPDATE tags SET icon = '练习册' WHERE name = 'Workbook' OR name = '练习册';
UPDATE tags SET icon = '书本' WHERE name = 'Textbook' OR name = '书本';
UPDATE tags SET icon = '学校' WHERE name = 'School' OR name = '学校';

-- Entertainment & Leisure
UPDATE tags SET icon = '电影' WHERE name = 'Movie' OR name = '电影';
UPDATE tags SET icon = '健身' WHERE name = 'Fitness' OR name = '健身';
UPDATE tags SET icon = '游戏' WHERE name = 'Games' OR name = '游戏';
UPDATE tags SET icon = '篮球' WHERE name = 'Basketball' OR name = '篮球';
UPDATE tags SET icon = '电影院' WHERE name = 'Cinema' OR name = '电影院';
UPDATE tags SET icon = '肌肉' WHERE name = 'Gym' OR name = '肌肉';
UPDATE tags SET icon = '派对' WHERE name = 'Party' OR name = '派对';
UPDATE tags SET icon = '游泳' WHERE name = 'Swimming' OR name = '游泳';
UPDATE tags SET icon = '票' WHERE name = 'Tickets' OR name = '票';
UPDATE tags SET icon = '儿童玩具' WHERE name = 'Toy' OR name = '儿童玩具';
UPDATE tags SET icon = '旅行' WHERE name = 'Travel' OR name = '旅行';
UPDATE tags SET icon = '旅游' WHERE name = 'Tourism' OR name = '旅游';
UPDATE tags SET icon = '音乐' WHERE name = 'Music' OR name = '音乐';
UPDATE tags SET icon = '游戏' WHERE name = 'Gaming' OR name = '游戏';
UPDATE tags SET icon = '娱乐' WHERE name = 'Entertainment' OR name = '娱乐';

-- Pets
UPDATE tags SET icon = '宠物' WHERE name = 'Pet' OR name = '宠物';
UPDATE tags SET icon = '宠物' WHERE name = 'Pets' OR name = '宠物';

-- Finance & Income
UPDATE tags SET icon = '银行' WHERE name = 'Bank' OR name = '银行';
UPDATE tags SET icon = '报销' WHERE name = 'Reimbursement' OR name = '报销';
UPDATE tags SET icon = '补助' WHERE name = 'Subsidy' OR name = '补助';
UPDATE tags SET icon = '电费' WHERE name = 'Electricity' OR name = '电费';
UPDATE tags SET icon = '分红' WHERE name = 'Dividend' OR name = '分红';
UPDATE tags SET icon = '燃气' WHERE name = 'Gas' OR name = '燃气';
UPDATE tags SET icon = '工资' WHERE name = 'Salary' OR name = '工资';
UPDATE tags SET icon = '红包' WHERE name = 'Red Packet' OR name = '红包';
UPDATE tags SET icon = '投资' WHERE name = 'Investment' OR name = '投资';
UPDATE tags SET icon = '奖金' WHERE name = 'Bonus' OR name = '奖金';
UPDATE tags SET icon = '借款' WHERE name = 'Loan' OR name = '借款';
UPDATE tags SET icon = '奶瓶' WHERE name = 'Baby Formula' OR name = '奶瓶';
UPDATE tags SET icon = '股票' WHERE name = 'Stocks' OR name = '股票';
UPDATE tags SET icon = '钱包' WHERE name = 'Wallet' OR name = '钱包';
UPDATE tags SET icon = '违章' WHERE name = 'Fine' OR name = '违章';

-- Default for any unmatched tags
UPDATE tags SET icon = '钱包' WHERE icon IS NULL OR icon = '';

-- Step 6: Insert default tags if they don't exist

-- Expense Categories (cost)
SELECT insert_tag_if_not_exists('Food', '餐饮', 'cost');
SELECT insert_tag_if_not_exists('餐饮', '餐饮', 'cost');
SELECT insert_tag_if_not_exists('Shopping', '购物', 'cost');
SELECT insert_tag_if_not_exists('购物', '购物', 'cost');
SELECT insert_tag_if_not_exists('Transportation', '小车', 'cost');
SELECT insert_tag_if_not_exists('交通', '小车', 'cost');
SELECT insert_tag_if_not_exists('Entertainment', '娱乐', 'cost');
SELECT insert_tag_if_not_exists('娱乐', '娱乐', 'cost');
SELECT insert_tag_if_not_exists('Housing', '房租', 'cost');
SELECT insert_tag_if_not_exists('住房', '房租', 'cost');
SELECT insert_tag_if_not_exists('Utilities', '水电', 'cost');
SELECT insert_tag_if_not_exists('水电', '水电', 'cost');
SELECT insert_tag_if_not_exists('Healthcare', '医院', 'cost');
SELECT insert_tag_if_not_exists('医疗', '医院', 'cost');
SELECT insert_tag_if_not_exists('Education', '教育', 'cost');
SELECT insert_tag_if_not_exists('教育', '教育', 'cost');
SELECT insert_tag_if_not_exists('Clothing', '衣服', 'cost');
SELECT insert_tag_if_not_exists('服装', '衣服', 'cost');
SELECT insert_tag_if_not_exists('Travel', '旅行', 'cost');
SELECT insert_tag_if_not_exists('旅行', '旅行', 'cost');
SELECT insert_tag_if_not_exists('Gifts', '礼物', 'cost');
SELECT insert_tag_if_not_exists('礼物', '礼物', 'cost');
SELECT insert_tag_if_not_exists('Electronics', '电脑', 'cost');
SELECT insert_tag_if_not_exists('电子产品', '电脑', 'cost');
SELECT insert_tag_if_not_exists('Pets', '宠物', 'cost');
SELECT insert_tag_if_not_exists('宠物', '宠物', 'cost');
SELECT insert_tag_if_not_exists('Fitness', '健身', 'cost');
SELECT insert_tag_if_not_exists('健身', '健身', 'cost');
SELECT insert_tag_if_not_exists('Books', '书籍', 'cost');
SELECT insert_tag_if_not_exists('书籍', '书籍', 'cost');
SELECT insert_tag_if_not_exists('Subscriptions', '票', 'cost');
SELECT insert_tag_if_not_exists('订阅', '票', 'cost');
SELECT insert_tag_if_not_exists('Dining Out', '餐饮', 'cost');
SELECT insert_tag_if_not_exists('外出就餐', '餐饮', 'cost');
SELECT insert_tag_if_not_exists('Groceries', '蔬菜', 'cost');
SELECT insert_tag_if_not_exists('杂货', '蔬菜', 'cost');
SELECT insert_tag_if_not_exists('Toy', '儿童玩具', 'cost');
SELECT insert_tag_if_not_exists('儿童玩具', '儿童玩具', 'cost');

-- Income Categories (income)
SELECT insert_tag_if_not_exists('Salary', '工资', 'income');
SELECT insert_tag_if_not_exists('工资', '工资', 'income');
SELECT insert_tag_if_not_exists('Bonus', '奖金', 'income');
SELECT insert_tag_if_not_exists('奖金', '奖金', 'income');
SELECT insert_tag_if_not_exists('Investment', '投资', 'income');
SELECT insert_tag_if_not_exists('投资', '投资', 'income');
SELECT insert_tag_if_not_exists('Dividend', '分红', 'income');
SELECT insert_tag_if_not_exists('分红', '分红', 'income');
SELECT insert_tag_if_not_exists('Gift', '红包', 'income');
SELECT insert_tag_if_not_exists('礼金', '红包', 'income');
SELECT insert_tag_if_not_exists('Refund', '报销', 'income');
SELECT insert_tag_if_not_exists('退款', '报销', 'income');
SELECT insert_tag_if_not_exists('Rental Income', '房租', 'income');
SELECT insert_tag_if_not_exists('租金收入', '房租', 'income');
SELECT insert_tag_if_not_exists('Freelance', '工作', 'income');
SELECT insert_tag_if_not_exists('自由职业', '工作', 'income');
SELECT insert_tag_if_not_exists('Side Hustle', '工作', 'income');
SELECT insert_tag_if_not_exists('副业', '工作', 'income');
SELECT insert_tag_if_not_exists('Allowance', '补助', 'income');
SELECT insert_tag_if_not_exists('津贴', '补助', 'income');

-- Step 7: Verify the updates (uncomment to run)
-- SELECT name, icon, category FROM tags ORDER BY category, name;

-- Step 8: Drop the temporary functions
DROP FUNCTION IF EXISTS insert_tag_if_not_exists(TEXT, TEXT, TEXT);
-- Keep the get_tag_icon_path function as it might be useful for queries 