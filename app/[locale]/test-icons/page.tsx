import { unstable_setRequestLocale } from 'next-intl/server';
import { TestIcons } from '@/app/components/test-icons';

interface TestIconsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TestIconsPage({ params }: TestIconsPageProps) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Icon Test Page</h1>
      <TestIcons />
    </div>
  );
} 