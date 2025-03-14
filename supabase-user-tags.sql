-- Create a user_tags table to store user-specific custom tags
CREATE TABLE IF NOT EXISTS public.user_tags (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('income', 'cost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, category)
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON public.user_tags(user_id);

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