'use client';

import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function LogoutButton() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
    >
      {isLoading ? t('processing') : t('logout')}
    </button>
  );
} 