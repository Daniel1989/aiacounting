import type { Metadata, Viewport } from "next";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '../../config';
import { Nav } from '@/app/components/nav';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { AndroidWebViewProvider } from '@/app/components/android-webview-provider';
import { StructuredData } from '@/app/components/seo/structured-data';

export const metadata: Metadata = {
  title: {
    default: "AI Accounting - Smart Mobile Accounting App",
    template: "%s | AI Accounting"
  },
  description: "Free AI-powered mobile accounting application. Manage your finances, track expenses, and generate reports with intelligent automation. Perfect for small businesses and personal finance.",
  keywords: [
    "AI accounting",
    "mobile accounting app",
    "free accounting software",
    "expense tracking",
    "financial management",
    "small business accounting",
    "personal finance",
    "automated bookkeeping",
    "financial reports",
    "invoice management"
  ],
  authors: [{ name: "AI Accounting Team" }],
  creator: "AI Accounting",
  publisher: "AI Accounting",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aiacounting.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'zh': '/zh',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AI Accounting - Smart Mobile Accounting App',
    description: 'Free AI-powered mobile accounting application. Manage your finances with intelligent automation.',
    siteName: 'AI Accounting',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Accounting - Smart Mobile Accounting App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Accounting - Smart Mobile Accounting App',
    description: 'Free AI-powered mobile accounting application. Manage your finances with intelligent automation.',
    images: ['/og-image.png'],
    creator: '@aiacounting',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'finance',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params: paramsPromise,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // In Next.js 15, we need to await the params
  const params = await paramsPromise;
  // Make sure locale is a valid value from our config
  const locale = params.locale as (typeof locales)[number];
  
  // Enable static rendering
  unstable_setRequestLocale(locale);
  
  const messages = await getMessages();

  return (
    <html lang={locale} className="light">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Accounting" />
        <meta name="application-name" content="AI Accounting" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
        <StructuredData type="WebApplication" locale={locale} />
        <StructuredData type="Organization" locale={locale} />
        <StructuredData type="WebSite" locale={locale} />
      </head>
      <body
        className={`antialiased bg-white text-gray-900`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AndroidWebViewProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow pb-16">
                {children}
              </main>
              <Suspense>
                <Nav locale={locale} />
              </Suspense>
            </div>
            <Toaster position="top-center" richColors />
          </AndroidWebViewProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 