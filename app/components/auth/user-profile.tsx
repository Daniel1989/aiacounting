'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function UserProfile() {
  const t = useTranslations('auth');
  const commonT = useTranslations('common');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-pulse">{commonT('loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center p-4">
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          {t('login')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
      <div className="text-center mb-4">
        <h3 className="font-medium text-lg">
          {user.email}
        </h3>
        <p className="text-sm text-gray-500">
          {user.email_confirmed_at ? t('emailVerified') : t('emailNotVerified')}
        </p>
      </div>
      
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
      >
        {t('logout')}
      </button>
    </div>
  );
} 