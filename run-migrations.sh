#!/bin/bash

# Navigate to the Supabase directory
cd "$(dirname "$0")/supabase"

echo "Running invite code migrations..."

# Define the migration files in the correct order
migrations=(
  "migrations/20240803_create_invite_codes_table.sql"
)

# Check if the files exist
for file in "${migrations[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Error: Migration file $file not found"
    exit 1
  fi
  echo "Found migration file: $file"
done

echo "Ready to apply migrations. Please run the SQL content of the file to create invite codes table:"
for file in "${migrations[@]}"; do
  echo " - $file"
done

echo ""
echo "You can use the Supabase Dashboard SQL Editor or the Supabase CLI to run these migrations."
echo "Example with Supabase CLI:"
echo "  supabase db reset"
echo "  or apply migrations manually with:"
echo "  cat migrations/20240803_create_invite_codes_table.sql | supabase db execute"
echo ""
echo "The table will include the built-in use_invite_code function with SECURITY DEFINER privileges." 