'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';

interface AddRecordFormProps {
  userId: string | null;
}

interface Tag {
  id: number;
  name: string;
  icon: string;
  category: 'income' | 'cost';
}

export function AddRecordForm({ userId }: AddRecordFormProps) {
  const t = useTranslations('records');
  const commonT = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [category, setCategory] = useState<'income' | 'cost'>('cost');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  
  // Fetch tags from Supabase
  useEffect(() => {
    async function fetchTags() {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Error fetching tags:', error);
        setError(t('errorFetchingTags'));
      } else {
        setTags(data || []);
      }
      
      setIsLoading(false);
    }
    
    fetchTags();
  }, [supabase, t]);
  
  // Filter tags by selected category
  const filteredTags = tags.filter(tag => tag.category === category);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError(t('notLoggedIn'));
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError(t('invalidAmount'));
      return;
    }
    
    if (!selectedTagId) {
      setError(t('selectTag'));
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Insert record into Supabase
      const { error } = await supabase
        .from('records')
        .insert([
          {
            user_id: userId,
            amount: parseFloat(amount),
            category,
            tag_id: selectedTagId,
            note: note || '',
          }
        ]);
      
      if (error) {
        throw error;
      }
      
      // Redirect to home page on success
      router.push(`/${locale}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error adding record:', err);
      setError(err.message || t('errorAddingRecord'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!userId) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">{t('pleaseLogin')}</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          {t('login')}
        </button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse">{commonT('loading')}</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category selector */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-2 text-center ${
              category === 'cost' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => {
              setCategory('cost');
              setSelectedTagId(null);
            }}
          >
            {t('expense')}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center ${
              category === 'income' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => {
              setCategory('income');
              setSelectedTagId(null);
            }}
          >
            {t('income')}
          </button>
        </div>
        
        {/* Amount input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('amount')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              ￥
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>
        
        {/* Tags selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('selectTag')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTagId(tag.id)}
                className={`flex flex-col items-center p-2 rounded-md ${
                  selectedTagId === tag.id
                    ? 'bg-emerald-100 border-2 border-emerald-500'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-2xl mb-1">{tag.icon}</span>
                <span className="text-xs">{tag.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Note input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('note')}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors"
        >
          {isSubmitting ? commonT('loading') : t('save')}
        </button>
      </form>
    </div>
  );
} 