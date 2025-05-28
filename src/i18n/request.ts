import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` is a Promise that resolves to the locale
  const locale = await requestLocale;
  
  // Fallback to 'zh' if no locale is provided
  const validLocale = locale || 'zh';
  
  return {
    locale: validLocale,
    messages: (await import(`../../app/messages/${validLocale}.json`)).default,
    timeZone: 'Asia/Shanghai',
    now: new Date(),
  };
}); 