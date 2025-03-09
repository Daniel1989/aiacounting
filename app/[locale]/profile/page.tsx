import { UserProfile } from '@/app/components/auth/user-profile';
import { LogoutButton } from '@/app/components/auth/logout-button';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

interface ProfilePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);
  
  // Use getTranslations instead of useTranslations for server components
  const t = await getTranslations('auth');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('profile')}</h1>
      <div className="space-y-6">
        <UserProfile />
        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
} 