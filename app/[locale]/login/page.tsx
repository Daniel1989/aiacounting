import { LoginForm } from '@/app/components/auth/login-form';
import { ResponsiveHome } from '@/app/components/responsive-home';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { TermsAgreementCheckbox } from '@/app/components/auth/terms-agreement-checkbox';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: { redirectTo?: string };
}

export default async function LoginPage({ 
  params, 
  searchParams 
}: any) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);
  
  // Use getTranslations instead of useTranslations for server components
  const t = await getTranslations('auth');
  
  // Get the redirect URL from the search params
  // The middleware will handle redirecting authenticated users
  // We only render the login form for unauthenticated users
  
  return (
    <ResponsiveHome>
      <div className="flex flex-col items-center min-h-screen p-4">
        <div className="w-full max-w-md mt-4 mb-8">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <LoginForm />
          
          <div className="mt-6 text-center">
            <TermsAgreementCheckbox locale={locale} searchParams={searchParams} />
          </div>
        </div>
      </div>
    </ResponsiveHome>
  );
} 