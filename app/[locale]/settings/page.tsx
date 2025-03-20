import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/app/lib/server';
import { UserProfileSettings } from '@/app/components/settings/user-profile-settings';
import { InviteCodeSettings } from '@/app/components/settings/invite-code-settings';
import { AdminInviteCodes } from '@/app/components/settings/admin-invite-codes';
import { LegalLinks } from '@/app/components/settings/legal-links';
import { LogoutButton } from '@/app/components/auth/logout-button';
import { hasUserUsedInviteCode } from '@/app/lib/supabase/invite-codes';

// Admin user auth ID - this would typically be stored in environment variables
const ADMIN_AUTH_ID = process.env.ADMIN_AUTH_ID || '';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: { admin?: string };
}

export default async function SettingsPage({ params, searchParams }: any) {
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
  
  // Check if the user has used any invite code
  let hasUsedInviteCode = false;
  if (user && user.auth_id) {
    hasUsedInviteCode = await hasUserUsedInviteCode(user.auth_id);
  }

  // Check if user is admin by comparing auth_id with the admin auth ID
  // Also check for the admin query parameter route for extra security
  const isAdmin = Boolean(
    user?.auth_id && 
    user.auth_id === ADMIN_AUTH_ID && 
    searchParams.admin === 'true'
  );

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
      
      {/* Invite Code Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('inviteCode')}</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <InviteCodeSettings userId={userId} hasUsedInviteCode={hasUsedInviteCode} />
        </div>
      </section>
      
      {/* Admin Invite Code Generation - Only visible to admin */}
      {isAdmin && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('adminInviteCodes')}</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <AdminInviteCodes userId={userId} />
          </div>
        </section>
      )}
      
      {/* Account Actions Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('accountActions')}</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{t('logout')}</h3>
              <p className="text-gray-600 text-sm mb-3">{t('logoutDescription')}</p>
              <LogoutButton variant="danger" />
            </div>
          </div>
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