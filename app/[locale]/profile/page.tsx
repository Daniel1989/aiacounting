import { UserProfile } from '@/app/components/auth/user-profile';
import { LogoutButton } from '@/app/components/auth/logout-button';
import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

interface ProfilePageProps {
  params: {
    locale: string;
  };
}

export default function ProfilePage({ params: { locale } }: ProfilePageProps) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('auth');

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