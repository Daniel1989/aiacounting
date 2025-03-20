'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { PlusCircle, CopyIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { InviteCode } from '@/app/lib/supabase/invite-codes';

interface AdminInviteCodesProps {
  userId: string | null;
}

export function AdminInviteCodes({ userId }: AdminInviteCodesProps) {
  const t = useTranslations('settings');
  const commonT = useTranslations('common');
  const pathname = usePathname();
  
  // Extract locale from the pathname
  const locale = pathname.split('/')[1];
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Only show this component if the user is the specific admin
  const ADMIN_USER_ID = '6b6b4194-aabe-4f34-b57c-32cbb7fa4b57';
  
  if (userId !== ADMIN_USER_ID) {
    return null;
  }
  
  const handleCreateCode = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/${locale}/api/invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxUses: maxUses,
          expiresInDays: expiresInDays === '' ? null : expiresInDays
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create invite code');
      }
      
      const data = await response.json();
      setInviteCodes([data.inviteCode, ...inviteCodes]);
      setSuccess(t('inviteCodeGenerated'));
    } catch (err) {
      console.error('Error creating invite code:', err);
      setError(t('inviteCodeGenerationError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('never');
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm flex items-start">
            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
              {t('maxUses')}
            </label>
            <input
              id="maxUses"
              type="number"
              min="1"
              max="100"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="1"
            />
          </div>
          
          <div>
            <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-1">
              {t('expiresInDays')}
            </label>
            <input
              id="expiresInDays"
              type="number"
              min="1"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder={t('never')}
            />
          </div>
        </div>
        
        <button
          onClick={handleCreateCode}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {commonT('loading')}
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('generateCode')}
            </>
          )}
        </button>
      </div>
      
      {inviteCodes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('generatedCodes')}</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('code')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('maxUses')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('usesCount')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('expires')}</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inviteCodes.map((inviteCode) => (
                  <tr key={inviteCode.id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-mono text-sm">{inviteCode.code}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {inviteCode.max_uses}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {inviteCode.uses_count}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDate(inviteCode.expires_at)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(inviteCode.code)}
                        className="inline-flex items-center px-2 py-1 text-sm text-gray-700 hover:text-emerald-600"
                        title={t('copyCode')}
                      >
                        {copiedCode === inviteCode.code ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <CopyIcon className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 