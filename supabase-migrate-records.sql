-- Create a migration function to update existing records
CREATE OR REPLACE FUNCTION migrate_records_tags() RETURNS void AS $$
BEGIN
    -- Update records with user_tag_id to set is_user_tag to true and copy user_tag_id to tag_id
    UPDATE public.records
    SET is_user_tag = TRUE, tag_id = user_tag_id
    WHERE user_tag_id IS NOT NULL AND tag_id IS NULL;
    
    -- Update records with tag_id but no user_tag_id to ensure is_user_tag is false
    UPDATE public.records
    SET is_user_tag = FALSE
    WHERE user_tag_id IS NULL AND tag_id IS NOT NULL AND is_user_tag IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_records_tags();

-- Drop the migration function after use
DROP FUNCTION migrate_records_tags(); 