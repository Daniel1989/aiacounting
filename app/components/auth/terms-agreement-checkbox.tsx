'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface TermsAgreementCheckboxProps {
  locale: string;
  searchParams: { [key: string]: string };
}

export function TermsAgreementCheckbox({ locale, searchParams }: TermsAgreementCheckboxProps) {
  const t = useTranslations('auth');
  const [isChecked, setIsChecked] = useState(false);
  
  // Set up an effect to update the login button state based on checkbox
  useEffect(() => {
    const loginButton = document.querySelector('button[data-terms-agreement-button]') as HTMLButtonElement;
    if (loginButton) {
      loginButton.disabled = !isChecked;
      // Update button style based on checkbox state
      if (isChecked) {
        loginButton.classList.remove('bg-gray-400');
        loginButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
      } else {
        loginButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        loginButton.classList.add('bg-gray-400');
      }
    }
  }, [isChecked]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="terms-agreement"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          required
        />
        <label htmlFor="terms-agreement" className="ml-2 text-sm text-gray-500">
          {locale === 'zh' ? (
            <span>我同意<Link href={{ 
              pathname: '/terms',
              query: searchParams 
            }} className='text-blue-600 hover:text-blue-800'>《服务条款》</Link>和<Link href={{
              pathname: '/privacy',
              query: searchParams
            }} className='text-blue-600 hover:text-blue-800'>《隐私政策》</Link></span>
          ) : (
            <span>I agree to the <Link href={{ 
              pathname: '/terms',
              query: searchParams 
            }} className='text-blue-600 hover:text-blue-800'>Terms of Service</Link> and <Link href={{
              pathname: '/privacy',
              query: searchParams
            }} className='text-blue-600 hover:text-blue-800'>Privacy Policy</Link></span>
          )}
        </label>
      </div>
      {!isChecked && (
        <p className="text-xs text-red-500">
          {locale === 'zh' ? '请同意服务条款和隐私政策以继续' : 'Please agree to the terms and privacy policy to continue'}
        </p>
      )}
    </div>
  );
} 