-- First, let's create a backup of the current tags table
CREATE TABLE tags_backup AS SELECT * FROM tags;

-- Update the tags table to use tag names for icon lookup
-- We'll keep the icon column but change its meaning to store the icon name instead of the actual icon
-- This assumes the icon column already exists

-- Step 1: Extract the icon name from the current icon value (if needed)
-- This is a placeholder query - you may need to adjust it based on your actual data
UPDATE tags
SET icon = name
WHERE icon IS NOT NULL;

-- Step 2: Add a comment to clarify the new meaning of the icon column
COMMENT ON COLUMN tags.icon IS 'The name of the icon file (without extension) in the public/icons/tags directory';

-- Step 3: Create a function to generate the full icon path
-- This is optional but can be useful for consistency
CREATE OR REPLACE FUNCTION get_tag_icon_path(tag_name TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN 'tags/' || tag_name;
END;
$$ LANGUAGE plpgsql;

-- Example of how to use the function in a query:
-- SELECT id, name, get_tag_icon_path(name) as icon_path FROM tags;

-- If you need to rollback:
-- DROP TABLE IF EXISTS tags_backup;
-- DROP FUNCTION IF EXISTS get_tag_icon_path(TEXT); 