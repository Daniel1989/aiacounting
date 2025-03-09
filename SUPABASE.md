# Supabase Setup Instructions

This application uses Supabase for both authentication and database storage. Follow these steps to set up your Supabase project:

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project
3. Note your project URL and anon key (you'll need these for your `.env.local` file)

## 2. Set Up the Database

You can set up the database in two ways:

### Option 1: Using the SQL Editor

1. In your Supabase dashboard, go to the SQL Editor
2. Create a new query
3. Copy and paste the contents of the `supabase-setup.sql` file from this project
4. Run the query

### Option 2: Using the Supabase CLI

1. Install the Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
4. Push the SQL: `supabase db push < supabase-setup.sql`

## 3. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Under Email Auth, make sure "Enable Email Signup" is turned on
3. Configure any other authentication providers you want to use

## 4. Set Up Environment Variables

Make sure your `.env.local` file contains the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The application uses a `users` table with the following schema:

| Column     | Type                    | Description                       |
|------------|-------------------------|-----------------------------------|
| id         | UUID                    | Primary key                       |
| auth_id    | UUID                    | Supabase auth user ID (unique)    |
| email      | TEXT                    | User's email (unique)             |
| username   | TEXT                    | User's display name               |
| created_at | TIMESTAMP WITH TIME ZONE| Creation timestamp                |
| updated_at | TIMESTAMP WITH TIME ZONE| Last update timestamp             |

## Automatic User Creation

The setup includes a trigger that automatically creates a user record in the `users` table when a new user signs up through Supabase Auth. The user's email is used as the default username. 