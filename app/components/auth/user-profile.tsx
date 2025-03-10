'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabase/auth';
import { useTranslations } from 'next-intl';
import { DbUser } from '@/app/lib/supabase/database';

export function UserProfile() {
  const t = useTranslations('auth');
  const commonT = useTranslations('common');
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    
    async function fetchUser() {
      try {
        if (!isMounted) return;
        
        // First check if the user is authenticated with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (isMounted) setUser(null);
          return;
        }
        
        // Fetch the user from our database using a fetch request to our API
        const response = await fetch('/api/user');
        
        if (response.ok) {
          const userData = await response.json();
          if (isMounted) setUser(userData);
        } else {
          console.error('Failed to fetch user data');
          if (isMounted) setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse">{commonT('loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        {t('notLoggedIn')}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{t('profile')}</h2>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">{t('email')}</p>
          <p className="font-medium">{user.email}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">{t('username')}</p>
          <p className="font-medium">{user.username}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">{t('memberSince')}</p>
          <p className="font-medium">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 