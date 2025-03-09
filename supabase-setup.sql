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

-- Insert default tags
INSERT INTO public.tags (name, icon, category) VALUES
  ('Salary', '💰', 'income'),
  ('Bonus', '🎁', 'income'),
  ('Investment', '📈', 'income'),
  ('Food', '🍔', 'cost'),
  ('Transport', '🚗', 'cost'),
  ('Shopping', '🛍️', 'cost'),
  ('Entertainment', '🎬', 'cost'),
  ('Housing', '🏠', 'cost'),
  ('Utilities', '💡', 'cost'),
  ('Healthcare', '🏥', 'cost'),
  ('Education', '📚', 'cost'),
  ('Other', '📝', 'cost')
ON CONFLICT (id) DO NOTHING;

-- Create a records table to store financial records
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('income', 'cost')),
  tag_id INTEGER NOT NULL REFERENCES public.tags(id),
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_records_user_id ON public.records(user_id);

-- Create an index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_records_created_at ON public.records(created_at);

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