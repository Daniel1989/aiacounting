-- Insert default tags if they don't already exist
-- This script will add common expense and income categories with appropriate icons

-- First, let's create a function to insert tags if they don't exist
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

-- Expense Categories (cost)
SELECT insert_tag_if_not_exists('Food', 'canyin', 'cost');
SELECT insert_tag_if_not_exists('餐饮', 'canyin', 'cost');
SELECT insert_tag_if_not_exists('Shopping', 'shop', 'cost');
SELECT insert_tag_if_not_exists('购物', 'shop', 'cost');
SELECT insert_tag_if_not_exists('Transportation', 'xiaoche', 'cost');
SELECT insert_tag_if_not_exists('交通', 'xiaoche', 'cost');
SELECT insert_tag_if_not_exists('Entertainment', 'yule', 'cost');
SELECT insert_tag_if_not_exists('娱乐', 'yule', 'cost');
SELECT insert_tag_if_not_exists('Housing', 'fangzu', 'cost');
SELECT insert_tag_if_not_exists('住房', 'fangzu', 'cost');
SELECT insert_tag_if_not_exists('Utilities', 'shuidian', 'cost');
SELECT insert_tag_if_not_exists('水电', 'shuidian', 'cost');
SELECT insert_tag_if_not_exists('Healthcare', 'yiyuan', 'cost');
SELECT insert_tag_if_not_exists('医疗', 'yiyuan', 'cost');
SELECT insert_tag_if_not_exists('Education', 'education', 'cost');
SELECT insert_tag_if_not_exists('教育', 'education', 'cost');
SELECT insert_tag_if_not_exists('Clothing', 'yifu', 'cost');
SELECT insert_tag_if_not_exists('服装', 'yifu', 'cost');
SELECT insert_tag_if_not_exists('Travel', 'travel', 'cost');
SELECT insert_tag_if_not_exists('旅行', 'travel', 'cost');
SELECT insert_tag_if_not_exists('Gifts', 'liwu', 'cost');
SELECT insert_tag_if_not_exists('礼物', 'liwu', 'cost');
SELECT insert_tag_if_not_exists('Electronics', 'diannao', 'cost');
SELECT insert_tag_if_not_exists('电子产品', 'diannao', 'cost');
SELECT insert_tag_if_not_exists('Pets', 'pet', 'cost');
SELECT insert_tag_if_not_exists('宠物', 'pet', 'cost');
SELECT insert_tag_if_not_exists('Fitness', 'fitness', 'cost');
SELECT insert_tag_if_not_exists('健身', 'fitness', 'cost');
SELECT insert_tag_if_not_exists('Books', 'book', 'cost');
SELECT insert_tag_if_not_exists('书籍', 'book', 'cost');
SELECT insert_tag_if_not_exists('Subscriptions', 'ticket', 'cost');
SELECT insert_tag_if_not_exists('订阅', 'ticket', 'cost');
SELECT insert_tag_if_not_exists('Dining Out', 'canyin', 'cost');
SELECT insert_tag_if_not_exists('外出就餐', 'canyin', 'cost');
SELECT insert_tag_if_not_exists('Groceries', 'shucai', 'cost');
SELECT insert_tag_if_not_exists('杂货', 'shucai', 'cost');

-- Income Categories (income)
SELECT insert_tag_if_not_exists('Salary', 'gongji', 'income');
SELECT insert_tag_if_not_exists('工资', 'gongji', 'income');
SELECT insert_tag_if_not_exists('Bonus', 'jiangjin', 'income');
SELECT insert_tag_if_not_exists('奖金', 'jiangjin', 'income');
SELECT insert_tag_if_not_exists('Investment', 'invest', 'income');
SELECT insert_tag_if_not_exists('投资', 'invest', 'income');
SELECT insert_tag_if_not_exists('Dividend', 'fenhong', 'income');
SELECT insert_tag_if_not_exists('分红', 'fenhong', 'income');
SELECT insert_tag_if_not_exists('Gift', 'hongbao', 'income');
SELECT insert_tag_if_not_exists('礼金', 'hongbao', 'income');
SELECT insert_tag_if_not_exists('Refund', 'baoxiao', 'income');
SELECT insert_tag_if_not_exists('退款', 'baoxiao', 'income');
SELECT insert_tag_if_not_exists('Rental Income', 'fangzu', 'income');
SELECT insert_tag_if_not_exists('租金收入', 'fangzu', 'income');
SELECT insert_tag_if_not_exists('Freelance', 'job', 'income');
SELECT insert_tag_if_not_exists('自由职业', 'job', 'income');
SELECT insert_tag_if_not_exists('Side Hustle', 'job', 'income');
SELECT insert_tag_if_not_exists('副业', 'job', 'income');
SELECT insert_tag_if_not_exists('Allowance', 'buzhu', 'income');
SELECT insert_tag_if_not_exists('津贴', 'buzhu', 'income');

-- Drop the temporary function
DROP FUNCTION IF EXISTS insert_tag_if_not_exists(TEXT, TEXT, TEXT); 