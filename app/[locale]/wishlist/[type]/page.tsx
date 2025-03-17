import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import GoalSettingForm from '@/app/components/wishlist/goal-setting-form';

interface GoalSettingPageProps {
  params: {
    locale: string;
    type: string;
  };
}

export async function generateMetadata({ params }: GoalSettingPageProps) {
  const { locale, type } = params;
  const t = await getTranslations('wishlist');
  
  return {
    title: `${t('setGoal')} - ${t(`${type}.title`)}`,
  };
}

export default async function GoalSettingPage({ params }: GoalSettingPageProps) {
  const { locale, type } = params;
  const validTypes = ['travel', 'shopping', 'savings'];
  
  if (!validTypes.includes(type)) {
    redirect(`/${locale}/wishlist`);
  }
  
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect(`/${locale}/login`);
  }
  
  return <GoalSettingForm userId={user.id} locale={locale} type={type} />;
} 