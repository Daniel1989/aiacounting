import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '../../config';
import { Navigation } from '@/app/components/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Accounting",
  description: "Mobile-first accounting application",
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
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <Navigation locale={locale} />
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 