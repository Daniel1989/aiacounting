'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface LegalLinksProps {
  locale: string;
}

export function LegalLinks({ locale }: LegalLinksProps) {
  const t = useTranslations('settings');
  const searchParams = useSearchParams();
  
  // Define the CDN links for legal documents
  const legalLinks = [
    {
      id: 'terms',
      title: t('termsOfService'),
      url: `/terms`,
      description: t('termsDescription'),
    },
    {
      id: 'privacy',
      title: t('privacyPolicy'),
      url: `/privacy`,
      description: t('privacyDescription'),
    },
    // {
    //   id: 'cookies',
    //   title: t('cookiePolicy'),
    //   url: `https://cdn.aiacounting.com/${locale}/cookie-policy.html`,
    //   description: t('cookieDescription'),
    // },
  ];
  
  // Create an object from URLSearchParams for passing to Link
  console.log('searchParams', searchParams);
  const queryParams = Object.fromEntries(searchParams);
  
  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">{t('legalDescription')}</p>
      
      <ul className="space-y-3">
        {legalLinks.map((link) => (
          <li key={link.id} className="border-b border-gray-100 pb-3 last:border-0">
            <Link 
              href={{
                pathname: link.url,
                query: queryParams
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start hover:text-emerald-600 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium group-hover:text-emerald-600 flex items-center">
                  {link.title}
                  <ExternalLink className="ml-1 h-4 w-4 inline-block" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">{link.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 