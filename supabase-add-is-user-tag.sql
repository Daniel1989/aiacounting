-- Add is_user_tag field to records table
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS is_user_tag BOOLEAN DEFAULT FALSE;

-- Create an index on is_user_tag for faster filtering
CREATE INDEX IF NOT EXISTS idx_records_is_user_tag ON public.records(is_user_tag);

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN public.records.is_user_tag IS 'Flag indicating if the tag is a user-created tag';
COMMENT ON COLUMN public.records.tag_id IS 'Reference to either a system tag or a user tag'; 