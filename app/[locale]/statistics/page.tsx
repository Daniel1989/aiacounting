import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/app/lib/server';

interface StatisticsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function StatisticsPage({ params }: StatisticsPageProps) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);
  
  // Use getTranslations instead of useTranslations for server components
  const t = await getTranslations('nav');
  
  // Get the current user
  const user = await getCurrentUser();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('statistics')}</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p className="text-gray-500">Statistics feature coming soon...</p>
      </div>
    </div>
  );
} 