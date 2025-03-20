import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { getCurrentUser } from '@/app/lib/server';

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client
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
    
    // Parse the request body for the code
    const body = await request.json().catch(() => ({}));
    const { code } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }
    
    // First, check if the code exists and is valid
    const { data: codeData, error: findError } = await supabase
      .from('invite_codes')
      .select('id, code, max_uses, uses_count, is_active, expires_at')
      .eq('code', code)
      .single();
    
    if (findError || !codeData) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      );
    }
    
    // Check if the code is active and not expired
    if (!codeData.is_active) {
      return NextResponse.json(
        { error: 'This invite code is no longer active' },
        { status: 400 }
      );
    }
    
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite code has expired' },
        { status: 400 }
      );
    }
    
    // Check if max uses has been reached
    if (codeData.max_uses !== null && codeData.uses_count >= codeData.max_uses) {
      return NextResponse.json(
        { error: 'This invite code has reached its maximum number of uses' },
        { status: 400 }
      );
    }
    
    // Update the invite code to increment uses_count and possibly set it as inactive
    const newUsesCount = (codeData.uses_count || 0) + 1;
    const shouldDeactivate = codeData.max_uses !== null && newUsesCount >= codeData.max_uses;
    
    const { error: updateError } = await supabase
      .from('invite_codes')
      .update({
        uses_count: newUsesCount,
        used_by: userInfo.auth_id,
        is_active: !shouldDeactivate,
        updated_at: new Date().toISOString()
      })
      .eq('id', codeData.id);
    
    if (updateError) {
      console.error('Error updating invite code:', updateError);
      return NextResponse.json(
        { error: 'Failed to use invite code' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Invite code used successfully' 
    });
  } catch (error) {
    console.error('Error using invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 