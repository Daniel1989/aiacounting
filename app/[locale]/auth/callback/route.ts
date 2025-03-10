import { createClient } from '@/app/lib/supabase/authr';
import { NextRequest, NextResponse } from 'next/server';
import { syncUser } from '@/app/lib/supabase/database';

interface CallbackParams {
  params: Promise<{ locale: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: CallbackParams
) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
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
  return NextResponse.redirect(new URL(`/${locale}`, requestUrl.origin));
} 