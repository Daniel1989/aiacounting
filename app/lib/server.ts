'use server';

import { createClient } from './supabase/server';
import { getUserBySupabaseId } from './supabase/database';
import { redirect } from 'next/navigation';

/**
 * Gets the current user from Supabase and then from our database
 * Returns null if the user is not authenticated or not found in our database
 * @param shouldRedirect If true, redirects to login page if user is not authenticated
 * @param locale The current locale for redirection
 */
export async function getCurrentUser(shouldRedirect = false, locale = 'en') {
  const supabase = await createClient();
  
  // Get the user from Supabase
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  
  if (!supabaseUser) {
    if (shouldRedirect) {
      redirect(`/${locale}/login`);
    }
    return null;
  }
  
  // Get the user from our database
  const dbUser = await getUserBySupabaseId(supabaseUser.id);
  
  if (!dbUser && shouldRedirect) {
    redirect(`/${locale}/login`);
  }
  
  return dbUser;
}
