# Adding is_user_tag Field to Records Table

## Overview

This update adds an `is_user_tag` field to the `records` table to distinguish between system tags and user tags.

## Database Changes

```sql
-- Add is_user_tag field to records table
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS is_user_tag BOOLEAN DEFAULT FALSE;

-- Create an index on is_user_tag for faster filtering
CREATE INDEX IF NOT EXISTS idx_records_is_user_tag ON public.records(is_user_tag);

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN public.records.is_user_tag IS 'Flag indicating if the tag is a user-created tag';
COMMENT ON COLUMN public.records.tag_id IS 'Reference to either a system tag or a user tag';
```

## Code Usage

The `MoneyForm` component already includes the `is_user_tag` field when creating a new record:

```typescript
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

## Benefits

1. **Clear Distinction**: Easily distinguish between system tags and user tags
2. **Improved Filtering**: Index on `is_user_tag` allows for faster filtering
3. **Better Documentation**: Comments explain the purpose of the columns
4. **Simple Implementation**: No data migration needed as the table is empty 