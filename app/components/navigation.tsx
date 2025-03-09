'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase/client';

interface NavigationProps {
  locale: string;
}

export function Navigation({ locale }: NavigationProps) {
  const t = useTranslations('auth');
  const commonT = useTranslations('common');
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href={`/${locale}`} className="text-xl font-bold">
            AI Accounting
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              href={`/${locale}`} 
              className={`px-3 py-2 rounded-md ${pathname === `/${locale}` ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {commonT('home')}
            </Link>
            
            {isLoggedIn ? (
              <Link 
                href={`/${locale}/profile`} 
                className={`px-3 py-2 rounded-md ${pathname.includes('/profile') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {t('profile')}
              </Link>
            ) : (
              <Link 
                href={`/${locale}/login`} 
                className={`px-3 py-2 rounded-md ${pathname.includes('/login') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 