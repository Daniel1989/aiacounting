'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { CategorySection } from './category-section';
import { TagsSection } from './tags-section';
import { NoteSection } from './note-section';
import { NumberPadSection } from './number-pad-section';
import { toast } from 'sonner';
import { iconFileMap } from '@/app/components/ui/icon-component';

// Default tag names for filtering
const DEFAULT_COST_TAGS = ['房租', '水电', '交通', '学校', '日用', '餐饮', '购物', '娱乐', '旅游', '电影', '宠物'];
const DEFAULT_INCOME_TAGS = ['工资', '红包', '借款', '投资', '分红'];

interface MoneyFormProps {
  userId: string | null;
}

interface Tag {
  id: number;
  name: string;
  icon: string;
  category: 'income' | 'cost';
  isUserTag?: boolean;
  originalTagId?: number;
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
  const searchParams = useSearchParams();
  const locale = pathname.split('/')[1] || 'en';
  
  // Check for new tag parameters in the URL
  const newTagId = searchParams.get('newTagId');
  const newTagName = searchParams.get('newTagName');
  const newTagIcon = searchParams.get('newTagIcon');
  
  const [formData, setFormData] = useState<FormData>({
    tagId: -1,
    note: '',
    amount: 0
  });
  
  const [category, setCategory] = useState<'income' | 'cost'>('cost');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newTagAdded, setNewTagAdded] = useState<boolean>(false);
  
  const supabase = createClient();
  
  // Handle new tag from URL parameters
  useEffect(() => {
    if (newTagId && newTagName && newTagIcon && !newTagAdded) {
      // Create a new tag object from URL parameters
      const newTag: Tag = {
        id: parseInt(newTagId),
        name: newTagName,
        icon: newTagIcon,
        category: category,
        isUserTag: true
      };
      
      // Add the new tag to the tags list if it's not already there
      setTags(prevTags => {
        const tagExists = prevTags.some(tag => tag.id === parseInt(newTagId));
        if (!tagExists) {
          // Show success message
          toast.success(t('tagAdded'));
          // Select the new tag
          setFormData(prev => ({
            ...prev,
            tagId: parseInt(newTagId)
          }));
          return [...prevTags, newTag];
        }
        return prevTags;
      });
      
      setNewTagAdded(true);
      
      // Remove the parameters from the URL to prevent reapplying on refresh
      const newUrl = pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [newTagId, newTagName, newTagIcon, newTagAdded, pathname, router, category, t]);
  
  // Fetch tags from Supabase
  useEffect(() => {
    async function fetchTags() {
      setIsLoading(true);
      
      try {
        // Fetch default tags
        const { data: defaultTagsData, error: defaultTagsError } = await supabase
          .from('tags')
          .select('*')
          .order('id', { ascending: true });
        
        if (defaultTagsError) {
          throw defaultTagsError;
        }
        
        // Filter default tags based on predefined lists
        const filteredDefaultTags = defaultTagsData?.filter(tag => {
          const isDefaultTag = 
            (tag.category === 'cost' && DEFAULT_COST_TAGS.includes(tag.name)) ||
            (tag.category === 'income' && DEFAULT_INCOME_TAGS.includes(tag.name));
          
          // Check if the icon name exists in the mapping or is a valid file name itself
          const hasValidIcon = 
            iconFileMap[tag.icon] !== undefined || 
            Object.values(iconFileMap).includes(tag.icon);
          
          return isDefaultTag && hasValidIcon;
        }).map(tag => ({
          ...tag,
          isUserTag: false
        })) || [];
        
        // Fetch user-specific tags if user is logged in
        let userTags: Tag[] = [];
        if (userId) {
          const { data: userTagsData, error: userTagsError } = await supabase
            .from('user_tags')
            .select('*, tags:tag_id(*)')  // Join with tags table using tag_id
            .eq('user_id', userId)
            .order('id', { ascending: true });
          
          if (userTagsError) {
            throw userTagsError;
          }
          
          // Filter user tags to ensure valid icons
          userTags = userTagsData?.filter(tag => {
            const hasValidIcon = 
              iconFileMap[tag.icon] !== undefined || 
              Object.values(iconFileMap).includes(tag.icon);
            
            return hasValidIcon;
          }).map(tag => ({
            ...tag,
            isUserTag: true,
            // If this user tag is based on a system tag, include that information
            originalTagId: tag.tag_id
          })) || [];
        }
        
        // Combine default and user tags
        const combinedTags = [...filteredDefaultTags, ...userTags];
        setTags(combinedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast.error(t('errorFetchingTags'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTags();
  }, [supabase, t, userId]);
  
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
      // Find the selected tag to determine if it's a user tag or default tag
      const selectedTag = tags.find(tag => tag.id === formData.tagId);
      
      if (!selectedTag) {
        throw new Error('Selected tag not found');
      }
      
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
            is_user_tag: selectedTag.isUserTag || false
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed header */}
      <header className="sticky top-0 z-10 bg-white flex items-center justify-center px-5 py-2.5 min-h-[58px] text-xl shadow-sm">
        <div className="flex-1 text-left font-bold ml-2.5">{t('addRecord')}</div>
        <div className="flex-none text-right">
          <CategorySection value={category} onChange={setCategory} />
        </div>
      </header>
      
      {/* Scrollable tags section with calculated height to fit within viewport */}
      <div className="flex-1 overflow-auto pb-4">
        <TagsSection
          value={formData.tagId}
          category={category}
          tags={tags}
          onChange={(tagId) => handleChange({ tagId })}
        />
      </div>
      
      {/* Fixed bottom sections */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
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
    </div>
  );
} 