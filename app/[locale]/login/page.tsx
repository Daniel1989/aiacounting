import { LoginForm } from '@/app/components/auth/login-form';
import { ResponsiveHome } from '@/app/components/responsive-home';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth');
  
  return (
    <ResponsiveHome>
      <div className="flex flex-col items-center min-h-screen p-4">
        <div className="w-full max-w-md mt-4 mb-8">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            {t('termsAgreement')}
          </div>
        </div>
      </div>
    </ResponsiveHome>
  );
} 