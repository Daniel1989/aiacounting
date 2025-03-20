import { createClient } from './server';

export interface InviteCode {
  id: string;
  code: string;
  created_by: string | null;
  used_by: string | null;
  max_uses: number;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Gets all invite codes created by a user
 */
export async function getInviteCodesByUser(userId: string): Promise<InviteCode[]> {
  if (!userId) {
    return [];
  }

  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting invite codes:', error);
      return [];
    }
    
    return data as InviteCode[];
  } catch (error) {
    console.error('Error in getInviteCodesByUser:', error);
    return [];
  }
}

/**
 * Gets all invite codes used by a user
 */
export async function getInviteCodesUsedByUser(userId: string): Promise<InviteCode[]> {
  if (!userId) {
    return [];
  }

  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('used_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting used invite codes:', error);
      return [];
    }
    
    return data as InviteCode[];
  } catch (error) {
    console.error('Error in getInviteCodesUsedByUser:', error);
    return [];
  }
} 