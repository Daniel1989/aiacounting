-- Create a function that generates a random code
CREATE OR REPLACE FUNCTION generate_random_code(length INTEGER DEFAULT 8)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed similar looking characters
  result TEXT := '';
  i INTEGER := 0;
  random_index INTEGER;
  chars_length INTEGER := length(chars);
BEGIN
  FOR i IN 1..length LOOP
    random_index := floor(random() * chars_length + 1)::INTEGER;
    result := result || substr(chars, random_index, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function that can be called by admin users to create invite codes
-- This function bypasses RLS policies by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION admin_create_invite_code(
  creator_id UUID,
  code_value TEXT DEFAULT NULL,
  max_uses_value INTEGER DEFAULT 1,
  expires_in_days INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  generated_code TEXT;
  expiration_date TIMESTAMP WITH TIME ZONE;
  new_code_record RECORD;
BEGIN
  -- Generate a code if not provided
  IF code_value IS NULL THEN
    generated_code := generate_random_code(8);
  ELSE
    generated_code := code_value;
  END IF;
  
  -- Calculate expiration date if provided
  IF expires_in_days IS NOT NULL THEN
    expiration_date := NOW() + (expires_in_days * INTERVAL '1 day');
  ELSE
    expiration_date := NULL;
  END IF;
  
  -- Insert the new invite code
  INSERT INTO public.invite_codes (
    code,
    created_by,
    max_uses,
    is_active,
    expires_at
  ) VALUES (
    generated_code,
    creator_id,
    max_uses_value,
    TRUE,
    expiration_date
  )
  RETURNING * INTO new_code_record;
  
  -- Return the new code as JSONB
  RETURN row_to_json(new_code_record)::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy for bypassing RLS with the admin function
ALTER FUNCTION admin_create_invite_code SECURITY DEFINER SET search_path = public; 