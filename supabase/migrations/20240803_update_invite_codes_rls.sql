-- Drop existing policies for invite_codes table
DROP POLICY IF EXISTS "Anyone can view active invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Users can view their own created invite codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Users can view invite codes they've used" ON public.invite_codes;
DROP POLICY IF EXISTS "Only authenticated users can use invite codes" ON public.invite_codes;

-- Create updated policies
-- Allow anyone to view active invite codes (for validation)
CREATE POLICY "Anyone can view active invite codes"
  ON public.invite_codes FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Allow users to view invite codes they created
CREATE POLICY "Users can view their own created invite codes"
  ON public.invite_codes FOR SELECT
  USING (auth.uid() = created_by);

-- Allow users to view invite codes they've used
CREATE POLICY "Users can view invite codes they've used"
  ON public.invite_codes FOR SELECT
  USING (auth.uid() = used_by);

-- Allow users to insert their own invite codes if they are admin
CREATE POLICY "Admin can insert invite codes"
  ON public.invite_codes FOR INSERT
  WITH CHECK (auth.uid() = '6b6b4194-aabe-4f34-b57c-32cbb7fa4b57');

-- Allow authenticated users to update invite codes (for using them)
CREATE POLICY "Authenticated users can update invite codes"
  ON public.invite_codes FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())); 