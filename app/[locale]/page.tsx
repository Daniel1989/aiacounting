import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/app/lib/server';
import { HomeContent } from '@/app/components/home/home-content';
import { Metadata } from 'next';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('home');
  
  return {
    title: locale === 'zh' ? 'AI智能记账 - 免费移动记账应用' : 'AI Accounting - Free Smart Mobile Accounting App',
    description: locale === 'zh' 
      ? '免费AI智能记账应用，轻松管理个人和企业财务。自动分类、智能报表、多语言支持。适合小企业和个人理财。'
      : 'Free AI-powered accounting app for personal and business finance management. Automated categorization, smart reports, multi-language support. Perfect for small businesses and personal finance.',
    keywords: locale === 'zh'
      ? ['AI记账', '智能记账', '免费记账软件', '移动记账', '财务管理', '个人理财', '小企业记账', '自动记账']
      : ['AI accounting', 'smart bookkeeping', 'free accounting app', 'mobile finance', 'expense tracking', 'personal finance', 'small business accounting'],
    openGraph: {
      title: locale === 'zh' ? 'AI智能记账 - 免费移动记账应用' : 'AI Accounting - Free Smart Mobile Accounting App',
      description: locale === 'zh' 
        ? '免费AI智能记账应用，轻松管理个人和企业财务'
        : 'Free AI-powered accounting app for personal and business finance management',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  // In Next.js 15, we need to await the params
  const { locale } = await params;
  
  unstable_setRequestLocale(locale);
  
  // Use getTranslations instead of useTranslations for server components
  const t = await getTranslations('home');
  
  // Get the current user
  const user = await getCurrentUser();
  
  // Only pass the user ID to the client component to avoid serialization issues
  const userId = user?.id || null;

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <HomeContent userId={userId} />
    </div>
  );
} 