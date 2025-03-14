import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/app/lib/server';
import { AddTagForm } from '@/app/components/tags/add-tag-form';

interface AddTagPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AddTagPage({ params }: AddTagPageProps) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);
  
  // Use getTranslations instead of useTranslations for server components
  const t = await getTranslations('tags');
  
  // Get the current user with redirection enabled
  // This will automatically redirect to login if not authenticated
  const user = await getCurrentUser(true, locale);
  
  // Since we're using redirection, if we get here, we have a valid user
  // Only pass the user ID to the client component to avoid serialization issues
  const userId = user?.id || null;

  return (
    <div className="h-screen w-full overflow-hidden">
      <AddTagForm userId={userId} locale={locale} />
    </div>
  );
} 