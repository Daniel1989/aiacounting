-- Create invite_codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX invite_codes_code_idx ON public.invite_codes (code);

-- Enable row level security
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active invite codes"
  ON public.invite_codes FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can view their own created invite codes"
  ON public.invite_codes FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view invite codes they've used"
  ON public.invite_codes FOR SELECT
  USING (auth.uid() = used_by);

CREATE POLICY "Only authenticated users can use invite codes"
  ON public.invite_codes FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create functions for using invite codes
CREATE OR REPLACE FUNCTION public.use_invite_code(code_to_use TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  code_record RECORD;
BEGIN
  -- Check if the code exists and is active
  SELECT * INTO code_record 
  FROM public.invite_codes 
  WHERE code = code_to_use 
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF code_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the code has reached max uses
  IF code_record.max_uses IS NOT NULL AND code_record.uses_count >= code_record.max_uses THEN
    RETURN FALSE;
  END IF;
  
  -- Update the code record
  UPDATE public.invite_codes
  SET uses_count = uses_count + 1,
      used_by = CASE 
                  WHEN used_by IS NULL THEN auth.uid()
                  ELSE used_by 
                END,
      is_active = CASE 
                    WHEN max_uses IS NOT NULL AND uses_count + 1 >= max_uses THEN FALSE
                    ELSE is_active
                  END
  WHERE code = code_to_use;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 