'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales } from '../../config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChangeLocale = (newLocale: string) => {
    // Get the path without the locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    // Construct the new path with the new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Navigate to the new path
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChangeLocale(loc)}
          className={`px-2 py-1 text-sm rounded ${
            locale === loc
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          aria-current={locale === loc ? 'page' : undefined}
        >
          {loc === 'en' ? '🇺🇸 EN' : '🇨🇳 中文'}
        </button>
      ))}
    </div>
  );
} 