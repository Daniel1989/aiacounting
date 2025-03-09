'use server';

import { createClient } from './supabase/server';
import { getUserBySupabaseId } from './supabase/database';

/**
 * Gets the current user from Supabase and then from our database
 * Returns null if the user is not authenticated or not found in our database
 */
export async function getCurrentUser() {
  const supabase = createClient();
  
  // Get the user from Supabase
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  
  if (!supabaseUser) {
    return null;
  }
  
  // Get the user from our database
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  
  return dbUser;
}

/**
 * Checks if the user is authenticated
 * Returns true if the user is authenticated, false otherwise
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
} 