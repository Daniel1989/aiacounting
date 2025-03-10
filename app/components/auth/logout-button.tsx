'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/app/lib/supabase/client';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'danger';
}

export function LogoutButton({ 
  className = '', 
  variant = 'default' 
}: LogoutButtonProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Refresh the page to update the UI
      router.refresh();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const baseClasses = 'flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors';
  
  const variantClasses = variant === 'danger'
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-800';
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-label={t('logout')}
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoading ? t('processing') : t('logout')}</span>
    </button>
  );
} 