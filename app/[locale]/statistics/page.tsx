import { getCurrentUser } from '@/app/lib/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import StatisticsContent from '@/app/components/statistics/statistics-content';

interface StatisticsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: StatisticsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('statistics');
  
  return {
    title: t('title'),
  };
}

export default async function StatisticsPage({ params }: StatisticsPageProps) {
  const { locale } = await params;
  const user = await getCurrentUser(true, locale);
  const t = await getTranslations('statistics');
  
  if (!user) {
    return null;
  }
  
  return (
    <main className="flex flex-col h-full bg-[#f5f5f5]">
      <StatisticsContent userId={user.id} locale={locale} />
    </main>
  );
} 