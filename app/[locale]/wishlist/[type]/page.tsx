import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import GoalSettingForm from '@/app/components/wishlist/goal-setting-form';

interface GoalSettingPageProps {
  params: Promise<{
    locale: string;
    type: string;
  }>;
  searchParams: {
    edit?: string;
  };
}

export async function generateMetadata(props: any) {
  const params = await props.params;
  const t = await getTranslations('wishlist');
  
  // Get the type from params and use it to determine the title suffix
  let titleSuffix = '';
  
  if (params.type === 'travel') {
    titleSuffix = t('travel.title');
  } else if (params.type === 'shopping') {
    titleSuffix = t('shopping.title');
  } else if (params.type === 'savings') {
    titleSuffix = t('savings.title');
  }
  
  return {
    title: `${t('setGoal')} - ${titleSuffix}`,
  };
}

export default async function GoalSettingPage(props: any) {
  const params = await props.params;
  const { searchParams } = props;
  const { locale, type } = params;
  const { edit } = await searchParams;
  
  const validTypes = ['travel', 'shopping', 'savings'];
  
  if (!validTypes.includes(type)) {
    redirect(`/${locale}/wishlist`);
  }
  
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect(`/${locale}/login`);
  }
  
  let existingGoal = null;
  
  if (edit) {
    const { data: goalData } = await supabase
      .from('goals')
      .select('*')
      .eq('id', edit)
      .eq('user_id', user.id)
      .single();
    
    existingGoal = goalData;
  }
  
  return <GoalSettingForm 
    userId={user.id} 
    locale={locale} 
    type={type} 
    existingGoal={existingGoal}
  />;
} 