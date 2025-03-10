import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/app/lib/server';
import { UserProfileSettings } from '@/app/components/settings/user-profile-settings';
import { LegalLinks } from '@/app/components/settings/legal-links';
import { DbUser } from '@/app/lib/supabase/database';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);
  
  // Use getTranslations instead of useTranslations for server components
  const t = await getTranslations('settings');
  
  // Get the current user with redirection enabled
  // This will automatically redirect to login if not authenticated
  const user = await getCurrentUser(true, locale);
  
  // Since we're using redirection, if we get here, we have a valid user
  // Only pass the user ID to the client component to avoid serialization issues
  const userId = user?.id || null;

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl font-bold mb-6">{t('settings')}</h1>
      
      {/* User Profile Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('profile')}</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <UserProfileSettings userId={userId} user={null} />
        </div>
      </section>
      
      {/* Legal Links Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t('legal')}</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <LegalLinks locale={locale} />
        </div>
      </section>
    </div>
  );
} 