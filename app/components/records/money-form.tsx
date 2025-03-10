'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { CategorySection } from './category-section';
import { TagsSection } from './tags-section';
import { NoteSection } from './note-section';
import { NumberPadSection } from './number-pad-section';
import { toast } from 'sonner';
import { iconFileMap } from '@/app/components/ui/icon';

interface MoneyFormProps {
  userId: string | null;
}

interface Tag {
  id: number;
  name: string;
  icon: string;
  category: 'income' | 'cost';
}

interface FormData {
  tagId: number;
  note: string;
  amount: number;
}

export function MoneyForm({ userId }: MoneyFormProps) {
  const t = useTranslations('records');
  const commonT = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  
  const [formData, setFormData] = useState<FormData>({
    tagId: -1,
    note: '',
    amount: 0
  });
  
  const [category, setCategory] = useState<'income' | 'cost'>('cost');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
        toast.error(t('errorFetchingTags'));
      } else {
        // Filter out tags whose icon names don't exist in iconFileMap
        const validTags = data?.filter(tag => {
          console.log(tag.icon, iconFileMap[tag.icon]);
          // Check if the icon name exists in the mapping or is a valid file name itself
          return iconFileMap[tag.icon] !== undefined || 
                 Object.values(iconFileMap).includes(tag.icon);
        }) || [];
        
        setTags(validTags);
      }
      
      setIsLoading(false);
    }
    
    fetchTags();
  }, [supabase, t]);
  
  // Handle form data changes
  const handleChange = (obj: Partial<FormData>) => {
    setFormData({
      ...formData,
      ...obj
    });
  };
  
  // Save record
  const saveRecord = async (): Promise<void> => {
    if (!userId) {
      toast.error(t('notLoggedIn'));
      return Promise.reject();
    }
    
    if (formData.amount <= 0) {
      toast.warning(t('invalidAmount'));
      return Promise.reject();
    }
    
    if (formData.tagId === -1) {
      toast.warning(t('selectTag'));
      return Promise.reject();
    }
    
    try {
      // Insert record into Supabase
      const { error } = await supabase
        .from('records')
        .insert([
          {
            user_id: userId,
            amount: formData.amount,
            category,
            tag_id: formData.tagId,
            note: formData.note || '',
          }
        ]);
      
      if (error) {
        throw error;
      }
      
      toast.success(t('recordAdded'));
      
      // Reset form data
      setFormData({
        tagId: -1,
        note: '',
        amount: 0
      });
      
      // Refresh the page to show the updated data
      router.refresh();
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error adding record:', err);
      toast.error(err.message || t('errorAddingRecord'));
      return Promise.reject(err);
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
    <div className="flex flex-col h-full">
      <header className="relative flex items-center justify-center px-5 py-2.5 min-h-[58px] text-xl">
        <div className="flex-1 text-left font-bold ml-2.5">{t('addRecord')}</div>
        <div className="flex-none text-right">
          <CategorySection value={category} onChange={setCategory} />
        </div>
      </header>
      
      <TagsSection
        value={formData.tagId}
        category={category}
        tags={tags}
        onChange={(tagId) => handleChange({ tagId })}
      />
      
      <NoteSection
        value={formData.note}
        onChange={(note) => handleChange({ note })}
      />
      
      <NumberPadSection
        value={formData.amount}
        onChange={(amount) => handleChange({ amount })}
        onSave={saveRecord}
      />
    </div>
  );
} 