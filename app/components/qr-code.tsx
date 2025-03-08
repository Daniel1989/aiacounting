'use client';

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useTranslations } from 'next-intl';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export function QRCodeDisplay({ url, size = 200 }: QRCodeDisplayProps) {
  const t = useTranslations('qrCode');
  const [currentUrl, setCurrentUrl] = useState<string>(url);

  // Update QR code with current URL when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCode 
          value={currentUrl} 
          size={size}
          level="H"
          className="mx-auto"
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">{t('scanToVisit')}</p>
    </div>
  );
} 