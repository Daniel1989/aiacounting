import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales } from '../config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from requestLocale - it's a Promise<string | undefined>
  const localeValue = requestLocale ? await requestLocale : undefined;
  
  // Make sure we have a valid locale
  const validLocale = localeValue || 'zh';
  
  // Load messages for the requested locale
  const messages = (await import(`./messages/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages,
    timeZone: 'Asia/Shanghai',
    now: new Date(),
  };
});

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales }); 