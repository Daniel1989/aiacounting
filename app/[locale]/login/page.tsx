import { LoginForm } from '@/app/components/auth/login-form';
import { ResponsiveHome } from '@/app/components/responsive-home';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { TermsAgreementCheckbox } from '@/app/components/auth/terms-agreement-checkbox';
import { Metadata } from 'next';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'zh' ? '登录 - AI智能记账' : 'Login - AI Accounting',
    description: locale === 'zh' 
      ? '登录AI智能记账应用，开始管理您的财务。支持邮箱注册登录，安全可靠。'
      : 'Login to AI Accounting app and start managing your finances. Secure email registration and login.',
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: locale === 'zh' ? '登录 - AI智能记账' : 'Login - AI Accounting',
      description: locale === 'zh' 
        ? '登录AI智能记账应用，开始管理您的财务'
        : 'Login to AI Accounting app and start managing your finances',
    },
  };
}

export default async function LoginPage({ 
  params, 
  searchParams 
}: LoginPageProps) {
  // In Next.js 15, we need to await both params and searchParams
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  
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
            <TermsAgreementCheckbox locale={locale} searchParams={resolvedSearchParams} />
          </div>
        </div>
      </div>
    </ResponsiveHome>
  );
} 