'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, PiggyBank, BarChart, Settings } from 'lucide-react';

interface NavProps {
  locale: string;
}

export function Nav({ locale }: NavProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  
  // Check if the current path matches the given path
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.includes(`/${locale}${path}`);
  };
  
  return (
    <nav className="bg-[#f7f8f3] fixed bottom-0 left-0 right-0 z-10">
      <ul className="flex">
        <li className="w-1/4 text-sm">
          <Link 
            href={`/${locale}`}
            className={`py-2 px-1 flex flex-col items-center justify-center text-xs ${
              isActive('/') ? 'text-emerald-500' : 'text-gray-400'
            }`}
          >
            <Home 
              className={`w-6 h-6 mb-1 ${
                isActive('/') ? 'text-emerald-500' : 'text-gray-400'
              }`} 
            />
            {t('today')}
          </Link>
        </li>
        <li className="w-1/4 text-sm">
          <Link 
            href={`/${locale}/records/new`}
            className={`py-2 px-1 flex flex-col items-center justify-center text-xs ${
              isActive('/records/new') ? 'text-emerald-500' : 'text-gray-400'
            }`}
          >
            <PiggyBank 
              className={`w-6 h-6 mb-1 ${
                isActive('/records/new') ? 'text-emerald-500' : 'text-gray-400'
              }`} 
            />
            {t('addRecord')}
          </Link>
        </li>
        <li className="w-1/4 text-sm">
          <Link 
            href={`/${locale}/statistics`}
            className={`py-2 px-1 flex flex-col items-center justify-center text-xs ${
              isActive('/statistics') ? 'text-emerald-500' : 'text-gray-400'
            }`}
          >
            <BarChart 
              className={`w-6 h-6 mb-1 ${
                isActive('/statistics') ? 'text-emerald-500' : 'text-gray-400'
              }`} 
            />
            {t('statistics')}
          </Link>
        </li>
        <li className="w-1/4 text-sm">
          <Link 
            href={`/${locale}/settings`}
            className={`py-2 px-1 flex flex-col items-center justify-center text-xs ${
              isActive('/settings') ? 'text-emerald-500' : 'text-gray-400'
            }`}
          >
            <Settings 
              className={`w-6 h-6 mb-1 ${
                isActive('/settings') ? 'text-emerald-500' : 'text-gray-400'
              }`} 
            />
            {t('settings')}
          </Link>
        </li>
      </ul>
    </nav>
  );
} 