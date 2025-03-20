import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { getCurrentUser } from '@/app/lib/server';

// Admin user ID that is allowed to generate invite codes
const ADMIN_USER_ID = '6b6b4194-aabe-4f34-b57c-32cbb7fa4b57';

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with admin privileges
    const supabase = await createClient();
    
    // Get the current user
    const userInfo = await getCurrentUser();

    // If no user, return unauthorized
    if (!userInfo) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in' },
        { status: 401 }
      );
    }
    
    // Check if the user is authorized (has the specific user ID)
    if (userInfo.id !== ADMIN_USER_ID) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to generate invite codes' },
        { status: 403 }
      );
    }
    
    // Parse the request body for options
    const body = await request.json().catch(() => ({}));
    const options = {
      maxUses: body.maxUses || 1,
      expiresInDays: body.expiresInDays || null
    };
    
    // Create invite code using the serviceRole client to bypass RLS
    // Create a new invite code directly with SQL
    const { data, error } = await supabase.rpc('admin_create_invite_code', {
      creator_id: userInfo.auth_id,
      code_value: null, // let the function generate a code
      max_uses_value: options.maxUses,
      expires_in_days: options.expiresInDays
    });
    
    if (error) {
      console.error('Error creating invite code:', error);
      return NextResponse.json(
        { error: 'Failed to create invite code' },
        { status: 500 }
      );
    }
    
    // Return the new invite code
    return NextResponse.json({ inviteCode: data });
  } catch (error) {
    console.error('Error creating invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 