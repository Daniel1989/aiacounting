import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import WishlistContent from '@/app/components/wishlist/wishlist-content';

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
  
  return <WishlistContent userId={user.id} locale={locale} />;
} 