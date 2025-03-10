-- First, let's create a backup of the current tags table if not already done
CREATE TABLE IF NOT EXISTS tags_backup AS SELECT * FROM tags;

-- Update statements for each icon
-- Format: UPDATE tags SET icon = 'icon_name' WHERE name = 'tag_name' OR name = 'tag_name_chinese';

-- Transportation
UPDATE tags SET icon = 'babycar' WHERE name = 'Baby Stroller' OR name = '婴儿车';
UPDATE tags SET icon = 'bus' WHERE name = 'Bus' OR name = '公交车';
UPDATE tags SET icon = 'chuzuche' WHERE name = 'Taxi' OR name = '出租车';
UPDATE tags SET icon = 'diandongche' WHERE name = 'Electric Vehicle' OR name = '电动车';
UPDATE tags SET icon = 'feiji' WHERE name = 'Airplane' OR name = '飞机';
UPDATE tags SET icon = 'gongjiao' WHERE name = 'Public Transport' OR name = '公共交通';
UPDATE tags SET icon = 'jiayou' WHERE name = 'Fuel' OR name = '加油';
UPDATE tags SET icon = 'jiuhuche' WHERE name = 'Towing' OR name = '救护车';
UPDATE tags SET icon = 'taxi' WHERE name = 'Cab' OR name = '出租';
UPDATE tags SET icon = 'train' WHERE name = 'Train' OR name = '火车';
UPDATE tags SET icon = 'xiaoche' WHERE name = 'Car' OR name = '小车';
UPDATE tags SET icon = 'yingerche' WHERE name = 'Baby Car' OR name = '婴儿车';
UPDATE tags SET icon = 'youlun' WHERE name = 'Cruise' OR name = '游轮';

-- Food & Drink
UPDATE tags SET icon = 'canyin' WHERE name = 'Dining' OR name = '餐饮';
UPDATE tags SET icon = 'fruit' WHERE name = 'Fruits' OR name = '水果';
UPDATE tags SET icon = 'ice-cream' WHERE name = 'Ice Cream' OR name = '冰淇淋';
UPDATE tags SET icon = 'shucai' WHERE name = 'Vegetables' OR name = '蔬菜';
UPDATE tags SET icon = 'yinliao' WHERE name = 'Beverages' OR name = '饮料';

-- Shopping & Clothing
UPDATE tags SET icon = 'bag' WHERE name = 'Bag' OR name = '包';
UPDATE tags SET icon = 'clothes' WHERE name = 'Clothes' OR name = '衣服';
UPDATE tags SET icon = 'jeans' WHERE name = 'Jeans' OR name = '牛仔裤';
UPDATE tags SET icon = 'kouhong' WHERE name = 'Cosmetics' OR name = '口红';
UPDATE tags SET icon = 'kuzi' WHERE name = 'Pants' OR name = '裤子';
UPDATE tags SET icon = 'liwu' WHERE name = 'Gift' OR name = '礼物';
UPDATE tags SET icon = 'shop' WHERE name = 'Shopping' OR name = '购物';
UPDATE tags SET icon = 'shopping' WHERE name = 'Mall' OR name = '商场';
UPDATE tags SET icon = 'shoes' WHERE name = 'Shoes' OR name = '鞋子';
UPDATE tags SET icon = 'wanju' WHERE name = 'Toys' OR name = '玩具';
UPDATE tags SET icon = 'yifu' WHERE name = 'Clothing' OR name = '衣服';

-- Home & Living
UPDATE tags SET icon = 'diannao' WHERE name = 'Computer' OR name = '电脑';
UPDATE tags SET icon = 'fangzu' WHERE name = 'Rent' OR name = '房租';
UPDATE tags SET icon = 'laptop' WHERE name = 'Laptop' OR name = '笔记本';
UPDATE tags SET icon = 'phone' WHERE name = 'Phone' OR name = '手机';
UPDATE tags SET icon = 'riyong' WHERE name = 'Daily Necessities' OR name = '日用品';
UPDATE tags SET icon = 'shafa' WHERE name = 'Furniture' OR name = '沙发';
UPDATE tags SET icon = 'shuidian' WHERE name = 'Utilities' OR name = '水电';
UPDATE tags SET icon = 'tools' WHERE name = 'Tools' OR name = '工具';

-- Health & Medical
UPDATE tags SET icon = 'bingchuang' WHERE name = 'Hospital' OR name = '病床';
UPDATE tags SET icon = 'health' WHERE name = 'Health' OR name = '健康';
UPDATE tags SET icon = 'xindiantu' WHERE name = 'Medical Exam' OR name = '心电图';
UPDATE tags SET icon = 'yachi' WHERE name = 'Dental' OR name = '牙齿';
UPDATE tags SET icon = 'yaowan' WHERE name = 'Medicine' OR name = '药丸';
UPDATE tags SET icon = 'yisheng' WHERE name = 'Doctor' OR name = '医生';
UPDATE tags SET icon = 'yiyuan' WHERE name = 'Hospital' OR name = '医院';
UPDATE tags SET icon = 'zhen' WHERE name = 'Acupuncture' OR name = '针';

-- Education & Work
UPDATE tags SET icon = 'book' WHERE name = 'Books' OR name = '书籍';
UPDATE tags SET icon = 'education' WHERE name = 'Education' OR name = '教育';
UPDATE tags SET icon = 'job' WHERE name = 'Work' OR name = '工作';
UPDATE tags SET icon = 'laoshi' WHERE name = 'Teacher' OR name = '老师';
UPDATE tags SET icon = 'lianxice' WHERE name = 'Workbook' OR name = '练习册';
UPDATE tags SET icon = 'shuben' WHERE name = 'Textbook' OR name = '书本';
UPDATE tags SET icon = 'xuexiao' WHERE name = 'School' OR name = '学校';

-- Entertainment & Leisure
UPDATE tags SET icon = 'dianying' WHERE name = 'Movie' OR name = '电影';
UPDATE tags SET icon = 'fitness' WHERE name = 'Fitness' OR name = '健身';
UPDATE tags SET icon = 'game' WHERE name = 'Games' OR name = '游戏';
UPDATE tags SET icon = 'lanqiu' WHERE name = 'Basketball' OR name = '篮球';
UPDATE tags SET icon = 'movie' WHERE name = 'Cinema' OR name = '电影院';
UPDATE tags SET icon = 'muscle' WHERE name = 'Gym' OR name = '肌肉';
UPDATE tags SET icon = 'party' WHERE name = 'Party' OR name = '派对';
UPDATE tags SET icon = 'swimming' WHERE name = 'Swimming' OR name = '游泳';
UPDATE tags SET icon = 'ticket' WHERE name = 'Tickets' OR name = '票';
UPDATE tags SET icon = 'toy' WHERE name = 'Toy' OR name = '玩具';
UPDATE tags SET icon = 'travel' WHERE name = 'Travel' OR name = '旅行';
UPDATE tags SET icon = 'lvyou' WHERE name = 'Tourism' OR name = '旅游';
UPDATE tags SET icon = 'yinyue' WHERE name = 'Music' OR name = '音乐';
UPDATE tags SET icon = 'youxi' WHERE name = 'Gaming' OR name = '游戏';
UPDATE tags SET icon = 'yule' WHERE name = 'Entertainment' OR name = '娱乐';

-- Pets
UPDATE tags SET icon = 'chongwu' WHERE name = 'Pet' OR name = '宠物';
UPDATE tags SET icon = 'pet' WHERE name = 'Pets' OR name = '宠物';

-- Finance & Income
UPDATE tags SET icon = 'bank' WHERE name = 'Bank' OR name = '银行';
UPDATE tags SET icon = 'baoxiao' WHERE name = 'Reimbursement' OR name = '报销';
UPDATE tags SET icon = 'buzhu' WHERE name = 'Subsidy' OR name = '补助';
UPDATE tags SET icon = 'electric' WHERE name = 'Electricity' OR name = '电费';
UPDATE tags SET icon = 'fenhong' WHERE name = 'Dividend' OR name = '分红';
UPDATE tags SET icon = 'gas' WHERE name = 'Gas' OR name = '燃气';
UPDATE tags SET icon = 'gongji' WHERE name = 'Salary' OR name = '工资';
UPDATE tags SET icon = 'hongbao' WHERE name = 'Red Packet' OR name = '红包';
UPDATE tags SET icon = 'invest' WHERE name = 'Investment' OR name = '投资';
UPDATE tags SET icon = 'jiangjin' WHERE name = 'Bonus' OR name = '奖金';
UPDATE tags SET icon = 'jiekuan' WHERE name = 'Loan' OR name = '借款';
UPDATE tags SET icon = 'naiping' WHERE name = 'Baby Formula' OR name = '奶瓶';
UPDATE tags SET icon = 'stock' WHERE name = 'Stocks' OR name = '股票';
UPDATE tags SET icon = 'wallet' WHERE name = 'Wallet' OR name = '钱包';
UPDATE tags SET icon = 'weizhang' WHERE name = 'Fine' OR name = '违章';

-- Default for any unmatched tags
UPDATE tags SET icon = 'wallet' WHERE icon IS NULL OR icon = '';

-- Verify the updates
-- SELECT name, icon FROM tags ORDER BY name; 