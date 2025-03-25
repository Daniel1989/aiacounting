import { LoginForm } from '@/app/components/auth/login-form';
import { ResponsiveHome } from '@/app/components/responsive-home';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';

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
  const searchParamsRes = await searchParams;
  const redirectTo = searchParamsRes?.redirectTo || `/${locale}`;
  
  // The middleware will handle redirecting authenticated users
  // We only render the login form for unauthenticated users
  
  return (
    <ResponsiveHome>
      <div className="flex flex-col items-center min-h-screen p-4">
        <div className="w-full max-w-md mt-4 mb-8">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <LoginForm redirectTo={redirectTo} />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            { locale === 'zh' ? (
              <span>登录即表示您同意我们的<a href='/terms' className='text-blue-600 hover:text-blue-800'>《服务条款》</a>和<a href='/privacy' className='text-blue-600 hover:text-blue-800'>《隐私政策》</a></span>
            ) : t('termsAgreement')}
          </div>
        </div>
      </div>
    </ResponsiveHome>
  );
} 