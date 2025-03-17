import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import WishlistContent from '@/app/components/wishlist/wishlist-content';

interface WishlistPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: WishlistPageProps) {
  const t = await getTranslations('wishlist');
  
  return {
    title: t('title'),
  };
}

export default async function WishlistPage({ params: { locale } }: WishlistPageProps) {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect(`/${locale}/login`);
  }
  
  return <WishlistContent userId={user.id} locale={locale} />;
} 