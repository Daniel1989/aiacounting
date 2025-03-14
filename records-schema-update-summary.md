# Records Table Schema Update

## Overview

This update modifies the `records` table to support both system tags and user tags using a single `tag_id` field, with an additional `is_user_tag` flag to distinguish between them.

## Database Changes

### 1. Schema Updates (`supabase-update-records-schema.sql`)

```sql
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
```

### 2. Data Migration (`supabase-migrate-records.sql`)

```sql
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
```

## Code Changes

### Updated MoneyForm Component (`app/components/records/money-form.tsx`)

```typescript
// Insert record into Supabase
const { error } = await supabase
  .from('records')
  .insert([
    {
      user_id: userId,
      amount: formData.amount,
      category,
      tag_id: formData.tagId,
      note: formData.note || '',
      is_user_tag: selectedTag.isUserTag || false
    }
  ]);
```

## Key Features

1. **Single Tag ID Field**: 
   - Uses `tag_id` for both system and user tags
   - Adds `is_user_tag` flag to distinguish between them

2. **Data Validation**:
   - Trigger ensures `tag_id` references the correct table based on `is_user_tag`
   - Prevents invalid tag references

3. **Backward Compatibility**:
   - Keeps `user_tag_id` field for backward compatibility
   - Migration script updates existing records

4. **Performance Optimization**:
   - Index on `is_user_tag` for faster filtering
   - Clear documentation through column comments

## Implementation Steps

1. Run the schema update script (`supabase-update-records-schema.sql`)
2. Run the data migration script (`supabase-migrate-records.sql`)
3. Deploy the updated code to your application
4. After confirming everything works, consider removing the `user_tag_id` field in a future update

## Benefits

1. **Simplified Data Model**:
   - Single field for tag references with a clear flag for type
   - Consistent approach to storing tag references

2. **Improved Data Integrity**:
   - Validation trigger ensures references are valid
   - Clear relationship between records and tags

3. **Better Query Performance**:
   - Indexed fields for faster filtering
   - Simplified queries with consistent field usage

4. **Future-Proofing**:
   - Aligns with the addition of `tag_id` to the `user_tags` table
   - Supports future features like tag synchronization and analytics 