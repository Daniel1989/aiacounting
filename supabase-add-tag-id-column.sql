-- Add tag_id column to user_tags table
ALTER TABLE public.user_tags ADD COLUMN IF NOT EXISTS tag_id INTEGER REFERENCES public.tags(id) ON DELETE SET NULL;

-- Create an index on tag_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_id ON public.user_tags(tag_id);

-- Update the comment on the table
COMMENT ON TABLE public.user_tags IS 'User-specific custom tags with optional reference to system tags';

-- Comment on the tag_id column
COMMENT ON COLUMN public.user_tags.tag_id IS 'Reference to the original system tag, if this user tag is based on one'; 