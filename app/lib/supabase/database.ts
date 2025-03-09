import { createClient } from './server';

export interface DbUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

/**
 * Gets a user from Supabase by their auth ID
 */
export async function getUserBySupabaseId(supabaseId: string): Promise<DbUser | null> {
  if (!supabaseId) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', supabaseId)
    .single();

  if (error || !data) {
    console.error('Error fetching user by Supabase ID:', error);
    return null;
  }

  return data as DbUser;
}

/**
 * Gets a user from Supabase by their email
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  if (!email) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data as DbUser;
}

/**
 * Syncs a user from Supabase auth to the users table
 * If the user doesn't exist, it creates a new user record
 * If the user exists, it returns the existing user
 */
export async function syncUser(authUser: { id: string; email: string }): Promise<DbUser | null> {
  if (!authUser?.id || !authUser?.email) {
    throw new Error('Invalid user data provided');
  }

  const supabase = createClient();

  // Check if user already exists in our database
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single();

  // If user exists, return it
  if (existingUser && !fetchError) {
    return existingUser as DbUser;
  }

  // If user doesn't exist, create a new user
  // Default username to the user's email
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([
      {
        auth_id: authUser.id,
        email: authUser.email,
        username: authUser.email, // Default username to email
      }
    ])
    .select()
    .single();

  if (insertError || !newUser) {
    console.error('Error creating user:', insertError);
    return null;
  }

  return newUser as DbUser;
} 