'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface InviteCodeSettingsProps {
  userId: string | null;
  hasUsedInviteCode: boolean;
}

export function InviteCodeSettings({ userId, hasUsedInviteCode }: InviteCodeSettingsProps) {
  const t = useTranslations('settings');
  const commonT = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasActivatedCode, setHasActivatedCode] = useState(hasUsedInviteCode);
  
  // Update state when prop changes
  useEffect(() => {
    setHasActivatedCode(hasUsedInviteCode);
  }, [hasUsedInviteCode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError(t('notLoggedIn'));
      return;
    }
    
    if (!inviteCode.trim()) {
      setError(t('inviteCodeRequired'));
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call the API to use the invite code
      const response = await fetch(`/${locale}/api/use-invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: inviteCode.trim()
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to use invite code');
      }
      
      // Success
      setSuccess(t('inviteCodeSuccess'));
      setInviteCode('');
      setHasActivatedCode(true);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Error using invite code:', err);
      setError(t('inviteCodeError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!userId) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{t('notLoggedIn')}</p>
      </div>
    );
  }
  
  // Show different UI if the user has already used an invite code
  if (hasActivatedCode) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="mb-4 text-emerald-500">
          <Sparkles className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-medium text-emerald-700 mb-2">
          {t('inviteCodeActivated')}
        </h3>
        <p className="text-gray-600">
          {t('inviteCodeActivatedDescription')}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm flex items-start">
          <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={t('inviteCodePlaceholder')}
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('inviteCodeDescription')}
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-70"
        >
          {isSubmitting ? commonT('loading') : t('submitInviteCode')}
        </button>
      </form>
    </div>
  );
} 