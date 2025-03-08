'use client';

import { useEffect, useState } from 'react';
import { isMobileDevice } from '../utils/device-detection';
import { QRCodeDisplay } from './qr-code';
import { useTranslations } from 'next-intl';

interface ResponsiveHomeProps {
  children: React.ReactNode;
}

export function ResponsiveHome({ children }: ResponsiveHomeProps) {
  const t = useTranslations('qrCode');
  const commonT = useTranslations('common');
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  // Show loading state while detecting device
  if (isMobile === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{commonT('loading')}</p>
      </div>
    );
  }

  // Desktop view - show QR code
  if (!isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-2xl font-semibold mb-8">{t('scanToAccess')}</h1>
        <QRCodeDisplay url={typeof window !== 'undefined' ? window.location.href : ''} size={250} />
      </div>
    );
  }

  // Mobile view - show actual content
  return <>{children}</>;
} 