'use server';

import { createClient } from '@/app/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Get the user from the users table
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();
  
  if (error || !user) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return user;
} 