-- Add is_user_tag field to records table
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS is_user_tag BOOLEAN DEFAULT FALSE;

-- Add user_tag_id field to records table for backward compatibility
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS user_tag_id INTEGER REFERENCES public.user_tags(id) ON DELETE SET NULL;

-- Create an index on is_user_tag for faster filtering
CREATE INDEX IF NOT EXISTS idx_records_is_user_tag ON public.records(is_user_tag);

-- Add comments to explain the purpose of the columns
COMMENT ON COLUMN public.records.is_user_tag IS 'Flag indicating if the tag is a user-created tag';
COMMENT ON COLUMN public.records.tag_id IS 'Reference to either a system tag or a user tag';
COMMENT ON COLUMN public.records.user_tag_id IS 'Legacy field for backward compatibility, references user_tags table';

-- Update the records table to allow tag_id to reference either tags or user_tags
-- First, drop the existing foreign key constraint
ALTER TABLE public.records DROP CONSTRAINT IF EXISTS records_tag_id_fkey;

-- Then, add a trigger to validate tag_id references either tags or user_tags
CREATE OR REPLACE FUNCTION validate_tag_id() RETURNS TRIGGER AS $$
BEGIN
  -- If is_user_tag is true, check if tag_id exists in user_tags
  IF NEW.is_user_tag = TRUE THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_tags WHERE id = NEW.tag_id) THEN
      RAISE EXCEPTION 'tag_id % does not exist in user_tags table', NEW.tag_id;
    END IF;
  -- Otherwise, check if tag_id exists in tags
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.tags WHERE id = NEW.tag_id) THEN
      RAISE EXCEPTION 'tag_id % does not exist in tags table', NEW.tag_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_tag_id_trigger ON public.records;
CREATE TRIGGER validate_tag_id_trigger
  BEFORE INSERT OR UPDATE ON public.records
  FOR EACH ROW EXECUTE FUNCTION validate_tag_id(); 