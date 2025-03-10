import { createClient } from '@/app/lib/supabase/authr';
import { NextRequest, NextResponse } from 'next/server';
import { syncUser } from '@/app/lib/supabase/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Try to determine the locale from the referrer or default to 'en'
  const referrer = request.headers.get('referer') || '';
  const referrerUrl = new URL(referrer || requestUrl.origin);
  const localePath = referrerUrl.pathname.split('/')[1];
  const locale = ['en', 'zh'].includes(localePath) ? localePath : 'en';
  
  if (code) {
    const supabase = createClient();
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      // If there's an error, redirect to login page
      return NextResponse.redirect(new URL(`/${locale}/login`, requestUrl.origin));
    }
    
    // Get the user data after authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    // Sync the user with our database if authentication was successful
    if (user) {
      try {
        await syncUser({
          id: user.id,
          email: user.email || '',
        });
      } catch (error) {
        console.error('Error syncing user:', error);
        // Continue with the flow even if syncing fails
      }
    }
  }

  // URL to redirect to after sign in process completes
  // Use the detected locale for the redirect
  return NextResponse.redirect(new URL(`/${locale}`, requestUrl.origin));
} 