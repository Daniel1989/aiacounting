'use client';

interface StructuredDataProps {
  type: 'WebApplication' | 'Organization' | 'WebSite';
  locale: string;
}

export function StructuredData({ type, locale }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiacounting.app';
  
  const getStructuredData = () => {
    const commonData = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'WebApplication':
        return {
          ...commonData,
          name: locale === 'zh' ? 'AI智能记账' : 'AI Accounting',
          description: locale === 'zh' 
            ? '免费AI智能记账应用，轻松管理个人和企业财务。自动分类、智能报表、多语言支持。'
            : 'Free AI-powered accounting app for personal and business finance management. Automated categorization, smart reports, multi-language support.',
          url: baseUrl,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser, iOS, Android',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            category: 'Free'
          },
          featureList: [
            locale === 'zh' ? 'AI智能分类' : 'AI Smart Categorization',
            locale === 'zh' ? '多语言支持' : 'Multi-language Support',
            locale === 'zh' ? '移动优先设计' : 'Mobile-first Design',
            locale === 'zh' ? '实时同步' : 'Real-time Sync',
            locale === 'zh' ? '财务报表' : 'Financial Reports'
          ],
          screenshot: `${baseUrl}/screenshot-mobile.png`,
          softwareVersion: '1.0.0',
          author: {
            '@type': 'Organization',
            name: 'AI Accounting Team'
          }
        };

      case 'Organization':
        return {
          ...commonData,
          name: 'AI Accounting',
          description: locale === 'zh' 
            ? '提供免费AI智能记账解决方案的技术团队'
            : 'Technology team providing free AI-powered accounting solutions',
          url: baseUrl,
          logo: `${baseUrl}/icon-512.png`,
          sameAs: [
            // Add social media links when available
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['English', 'Chinese']
          }
        };

      case 'WebSite':
        return {
          ...commonData,
          name: locale === 'zh' ? 'AI智能记账' : 'AI Accounting',
          description: locale === 'zh' 
            ? '免费AI智能记账应用官网'
            : 'Official website of AI Accounting app',
          url: baseUrl,
          inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            name: 'AI Accounting Team'
          }
        };

      default:
        return commonData;
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
} 