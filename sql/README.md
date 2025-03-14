# SQL Database Setup

This folder contains SQL scripts for setting up and managing the database for the AI Accounting application.

## Files

- `setup.sql`: Comprehensive database setup script that includes all table definitions, indexes, policies, and initial data.

## Database Structure

The database consists of the following tables:

1. **users**: Stores user information
   - Connected to Supabase Auth
   - Contains user profile data

2. **tags**: Stores system-defined expense and income categories
   - Predefined categories for both Chinese and English users
   - Contains icons for visual representation

3. **user_tags**: Stores user-created custom tags
   - References the original system tag if applicable
   - Allows users to create personalized categories

4. **records**: Stores financial records
   - Links to either system tags or user tags
   - Uses `is_user_tag` flag to distinguish between tag types

## How to Use

### Option 1: Using the Supabase SQL Editor

1. In your Supabase dashboard, go to the SQL Editor
2. Create a new query
3. Copy and paste the contents of the `setup.sql` file
4. Run the query

### Option 2: Using the Supabase CLI

1. Install the Supabase CLI
2. Log in to your Supabase account
3. Navigate to the project directory
4. Run: `supabase db push < sql/setup.sql`

## Security

The database uses Row Level Security (RLS) to ensure that:

- Users can only access their own data
- System tags are readable by all authenticated users
- User tags are only accessible by their creators

## Maintenance

When making changes to the database schema:

1. Update the `setup.sql` file with the new changes
2. Create a migration script if needed for existing data
3. Document the changes in this README 