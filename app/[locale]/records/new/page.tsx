import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/app/lib/server';
import { MoneyForm } from '@/app/components/records/money-form';

interface NewRecordPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewRecordPage({ params }: NewRecordPageProps) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);
  
  // Use getTranslations instead of useTranslations for server components
  const t = await getTranslations('records');
  
  // Get the current user
  const user = await getCurrentUser();
  
  // Only pass the user ID to the client component to avoid serialization issues
  const userId = user?.id || null;

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      <h1 className="sr-only">{t('addRecord')}</h1>
      <MoneyForm userId={userId} />
    </div>
  );
} 