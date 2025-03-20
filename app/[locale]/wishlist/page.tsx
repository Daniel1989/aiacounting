import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import WishlistContent from '@/app/components/wishlist/wishlist-content';
import { hasUserUsedInviteCode } from '@/app/lib/supabase/invite-codes';
import { getCurrentUser } from '@/app/lib/server';

interface WishlistPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: WishlistPageProps) {
  const { locale } = await params;
  const t = await getTranslations('wishlist');
  
  return {
    title: t('title'),
  };
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect(`/${locale}/login`);
  }
  
  // Get current user with auth_id for checking invite code
  const currentUser = await getCurrentUser();
  
  // Check if the user has activated an invite code
  let hasActivatedInviteCode = false;
  if (currentUser && currentUser.auth_id) {
    hasActivatedInviteCode = await hasUserUsedInviteCode(currentUser.auth_id);
  }
  
  return <WishlistContent 
    userId={user.id} 
    locale={locale} 
    hasActivatedInviteCode={hasActivatedInviteCode} 
  />;
} 