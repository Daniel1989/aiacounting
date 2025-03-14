-- =============================================
-- Comprehensive Database Setup for AI Accounting
-- =============================================

-- =================
-- Users Table Setup
-- =================

-- Create a users table to store user information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can read their own data" ON public.users
  FOR SELECT
  USING (auth.uid() = auth_id);

-- Create a policy that allows authenticated users to update their own data
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = auth_id);

-- Create a function to handle user creation after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, username)
  VALUES (NEW.id, NEW.email, NEW.email)
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function after a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================
-- Tags Table Setup
-- =================

-- Create a tags table to store expense and income categories
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('income', 'cost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to read tags
CREATE POLICY "Anyone can read tags" ON public.tags
  FOR SELECT
  USING (true);

-- ===================
-- User Tags Table Setup
-- ===================

-- Create a user_tags table to store user-specific custom tags
CREATE TABLE IF NOT EXISTS public.user_tags (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('income', 'cost')),
  tag_id INTEGER REFERENCES public.tags(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, category)
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON public.user_tags(user_id);

-- Create an index on tag_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_id ON public.user_tags(tag_id);

-- Add comments to explain the purpose of the columns
COMMENT ON TABLE public.user_tags IS 'User-specific custom tags with optional reference to system tags';
COMMENT ON COLUMN public.user_tags.tag_id IS 'Reference to the original system tag, if this user tag is based on one';

-- Enable Row Level Security
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own tags
CREATE POLICY "Users can read their own tags" ON public.user_tags
  FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Create a policy that allows users to insert their own tags
CREATE POLICY "Users can insert their own tags" ON public.user_tags
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Create a policy that allows users to update their own tags
CREATE POLICY "Users can update their own tags" ON public.user_tags
  FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Create a policy that allows users to delete their own tags
CREATE POLICY "Users can delete their own tags" ON public.user_tags
  FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- ===================
-- Records Table Setup
-- ===================

-- Create a records table to store financial records
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('income', 'cost')),
  tag_id INTEGER NOT NULL REFERENCES public.tags(id),
  is_user_tag BOOLEAN DEFAULT FALSE,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_records_user_id ON public.records(user_id);

-- Create an index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_records_created_at ON public.records(created_at);

-- Create an index on is_user_tag for faster filtering
CREATE INDEX IF NOT EXISTS idx_records_is_user_tag ON public.records(is_user_tag);

-- Add comments to explain the purpose of the columns
COMMENT ON COLUMN public.records.is_user_tag IS 'Flag indicating if the tag is a user-created tag';
COMMENT ON COLUMN public.records.tag_id IS 'Reference to either a system tag or a user tag';

-- Enable Row Level Security
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own records
CREATE POLICY "Users can read their own records" ON public.records
  FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Create a policy that allows users to insert their own records
CREATE POLICY "Users can insert their own records" ON public.records
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Create a policy that allows users to update their own records
CREATE POLICY "Users can update their own records" ON public.records
  FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Create a policy that allows users to delete their own records
CREATE POLICY "Users can delete their own records" ON public.records
  FOR DELETE
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- ===================
-- Initial Tags Data
-- ===================

-- Insert default Chinese tags
INSERT INTO tags (name, icon, category) VALUES
-- Food & Dining
('餐饮', '餐饮', 'cost'),
('水果', '水果', 'cost'),
('蔬菜', '蔬菜', 'cost'),
('饮料', '饮料', 'cost'),
('冰淇淋', '冰淇淋', 'cost'),

-- Transportation
('小车', '小车', 'cost'),
('出租车', '出租车', 'cost'),
('出租', '出租', 'cost'),
('公交车', '公交车', 'cost'),
('火车', '火车', 'cost'),
('飞机', '飞机', 'cost'),
('加油', '加油', 'cost'),
('电动车', '电动车', 'cost'),

-- Shopping & Clothing
('购物', '购物', 'cost'),
('商场', '商场', 'cost'),
('衣服', '衣服', 'cost'),
('鞋子', '鞋子', 'cost'),
('牛仔裤', '牛仔裤', 'cost'),
('裤子', '裤子', 'cost'),
('包', '包', 'cost'),
('口红', '口红', 'cost'),
('玩具', '玩具', 'cost'),
('儿童玩具', '儿童玩具', 'cost'),

-- Housing & Utilities
('房租', '房租', 'cost'),
('水电', '水电', 'cost'),
('电费', '电费', 'cost'),
('燃气', '燃气', 'cost'),
('沙发', '沙发', 'cost'),
('日用品', '日用品', 'cost'),

-- Electronics
('电脑', '电脑', 'cost'),
('笔记本', '笔记本', 'cost'),
('手机', '手机', 'cost'),
('工具', '工具', 'cost'),

-- Healthcare
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
('报销', '报销', 'income'),
('工作', '工作', 'income'),
('补助', '补助', 'income'),
('股票', '股票', 'income'),
('银行', '银行', 'income'),
('借款', '借款', 'income'),
('钱包', '钱包', 'income')
ON CONFLICT (id) DO NOTHING;
