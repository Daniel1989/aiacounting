import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { syncUser } from '@/app/lib/supabase/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
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
  return NextResponse.redirect(requestUrl.origin);
} 