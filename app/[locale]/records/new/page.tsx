import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/app/lib/auth';
import { AddRecordForm } from '@/app/components/records/add-record-form';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('addRecord')}</h1>
      <AddRecordForm userId={userId} />
    </div>
  );
} 