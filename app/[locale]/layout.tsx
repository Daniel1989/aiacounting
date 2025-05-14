import type { Metadata, Viewport } from "next";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '../../config';
import { Nav } from '@/app/components/nav';
import { Toaster } from 'sonner';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "AI Accounting",
  description: "Mobile-first accounting application",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      <body
        className={`antialiased bg-white text-gray-900`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow pb-16">
              {children}
            </main>
            <Suspense>
              <Nav locale={locale} />
            </Suspense>
          </div>
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 