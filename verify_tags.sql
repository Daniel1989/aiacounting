-- Verify tags in the database

-- Count total tags
SELECT COUNT(*) AS total_tags FROM tags;

-- Count tags by category
SELECT category, COUNT(*) AS tag_count 
FROM tags 
GROUP BY category 
ORDER BY category;

-- Show all expense categories (cost)
SELECT name, icon 
FROM tags 
WHERE category = 'cost' AND name IN (
  'Food', '餐饮', 'Transportation', '交通', 'Shopping', '购物',
  'Housing', '住房', 'Utilities', '水电', 'Healthcare', '医疗',
  'Education', '教育', 'Entertainment', '娱乐', 'Clothing', '服装',
  'Travel', '旅行'
)
ORDER BY name;

-- Show all income categories
SELECT name, icon 
FROM tags 
WHERE category = 'income' 
ORDER BY name;

-- Verify icon mapping
SELECT DISTINCT icon 
FROM tags 
ORDER BY icon; 