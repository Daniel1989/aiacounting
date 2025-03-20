import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import GoalSettingForm from '@/app/components/wishlist/goal-setting-form';
import { hasUserUsedInviteCode } from '@/app/lib/supabase/invite-codes';
import { getCurrentUser } from '@/app/lib/server';

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
    titleSuffix = t('saving.title');
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
  
  // Check if the user has activated an invite code if type is shopping or savings
  if (type === 'shopping' || type === 'savings') {
    const currentUser = await getCurrentUser();
    
    let hasActivatedInviteCode = false;
    if (currentUser && currentUser.auth_id) {
      hasActivatedInviteCode = await hasUserUsedInviteCode(currentUser.auth_id);
    }
    
    // Redirect to wishlist page if premium feature not activated
    if (!hasActivatedInviteCode) {
      redirect(`/${locale}/wishlist`);
    }
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
    
    // If editing a premium goal type without premium access, redirect
    if ((existingGoal?.type === 'shopping' || existingGoal?.type === 'savings')) {
      const currentUser = await getCurrentUser();
      
      let hasActivatedInviteCode = false;
      if (currentUser && currentUser.auth_id) {
        hasActivatedInviteCode = await hasUserUsedInviteCode(currentUser.auth_id);
      }
      
      if (!hasActivatedInviteCode) {
        redirect(`/${locale}/wishlist`);
      }
    }
  }
  
  return <GoalSettingForm 
    userId={user.id} 
    locale={locale} 
    type={type} 
    existingGoal={existingGoal}
  />;
} 