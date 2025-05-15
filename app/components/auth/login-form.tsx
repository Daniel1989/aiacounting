'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

type AuthMode = 'login' | 'register';

export function LoginForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Extract locale from pathname
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setLoginSuccess(false);

    try {
      if (mode === 'login') {
        // Sign in with password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error(t('errors.invalidCredentials'));
          }
          throw error;
        }
        
        if (!data.session) {
          throw new Error('No session returned after login');
        }
        
        // Show success message
        setMessage(t('success.loginSuccess'));
        setLoginSuccess(true);
        console.log('Login successful');
        if((window as any).bitJsBridge) {
          (window as any).bitJsBridge.login(window.location.href);
        }
        // Wait a moment to let the session be established
        setTimeout(() => {
          // Refresh to ensure the session is properly loaded
          console.log('Refreshing...');
          
          // Get the current URL search parameters to preserve them
          const searchParams = new URLSearchParams(window.location.search);
          // Build the redirect URL with all search parameters
          let redirectPath = `/${locale}`;
          
          // Preserve all other search parameters except 'from' (since we've used it)
          const newSearchParams = new URLSearchParams();
          searchParams.forEach((value, key) => {
              newSearchParams.append(key, value);
          });
          
          // Add search parameters to the redirect URL if there are any
          const queryString = newSearchParams.toString();
          if (queryString) {
            redirectPath += `?${queryString}`;
          }
          
          window.location.href = redirectPath;
        }, 1000);
      } else {
        // For registration, use the non-localized callback route
        // This is because the email link will not have the locale information
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error(t('errors.emailAlreadyInUse'));
          } else if (error.message.includes('password')) {
            throw new Error(t('errors.weakPassword'));
          }
          throw error;
        }
        
        setMessage(t('success.registrationSuccess'));
        setMode('login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || t('errors.genericError'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setMessage(null);
    setLoginSuccess(false);
  };

  // If login was successful, show a more prominent success message
  if (loginSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <h2 className="text-xl font-bold text-green-700 mb-2">{t('success.loginSuccess')}</h2>
          <p className="mb-4">{t('success.redirecting')}</p>
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          {mode === 'login' ? t('login') : t('register')}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {mode === 'login' ? t('loginToAccount') : t('createAccount')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={mode === 'register' ? t('minPasswordLength') : t('yourPassword')}
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
        >
          {isLoading ? t('processing') : mode === 'login' ? t('login') : t('register')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={toggleMode}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
        </button>
      </div>
    </div>
  );
} 