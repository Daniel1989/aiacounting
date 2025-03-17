'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Check } from 'lucide-react';
import { Icon, iconFileMap } from '@/app/components/ui/icon-component';

// Category name mapping
const CATEGORY_NAME_MAP: Record<string, string> = {
  'entertainment': '娱乐',
  'transport': '交通',
  'medical': '医护',
  'family': '亲子',
  'food': '餐饮',
  'shopping': '购物'
};

// Map to categorize icons based on their names
const ICON_CATEGORY_MAP: Record<string, string> = {
  // Entertainment
  '电影': 'entertainment',
  '游戏': 'entertainment',
  '票': 'entertainment',
  '游泳': 'entertainment',
  '音乐': 'entertainment',
  '娱乐': 'entertainment',
  
  // Transport
  '出租车': 'transport',
  '火车': 'transport',
  '公交车': 'transport',
  '小车': 'transport',
  '飞机': 'transport',
  '加油': 'transport',
  '电动车': 'transport',
  '出租': 'transport',
  '公交': 'transport',
  '游轮': 'transport',
  '交通': 'transport',
  
  // Medical
  '医院': 'medical',
  '医生': 'medical',
  '药丸': 'medical',
  '牙齿': 'medical',
  '健康': 'medical',
  '针': 'medical',
  '病床': 'medical',
  '心电图': 'medical',
  '医护': 'medical',
  
  // Family
  '宠物': 'family',
  '婴儿车': 'family',
  '奶瓶': 'family',
  '儿童玩具': 'family',
  '亲子': 'family',
  
  // Food
  '餐饮': 'food',
  '食物': 'food',
  '水果': 'food',
  '冰淇淋': 'food',
  '蔬菜': 'food',
  
  // Shopping
  '购物': 'shopping',
  '商场': 'shopping',
  '衣服': 'shopping',
  '鞋子': 'shopping',
  
  // Default to entertainment if not found
  'default': 'entertainment'
};

interface AddTagFormProps {
  userId: string | null;
  locale: string;
}

interface Tag {
  id: number;
  name: string;
  icon: string;
  category: 'income' | 'cost';
}

interface CategoryWithTags {
  category: string;
  title: string;
  tags: {
    icon: string;
    name: string;
    isUserTag: boolean;
    id?: number;
  }[];
}

export function AddTagForm({ userId, locale }: AddTagFormProps) {
  const t = useTranslations('tags');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the return URL and category from search params
  const returnUrl = searchParams.get('returnUrl') || `/${locale}/records/new`;
  const initialCategory = (searchParams.get('category') as 'income' | 'cost') || 'cost';
  
  const [tagName, setTagName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [tagCategory, setTagCategory] = useState<'income' | 'cost'>(initialCategory);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesWithTags, setCategoriesWithTags] = useState<CategoryWithTags[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  
  const supabase = createClient();
  
  // Fetch all tags and organize them by category
  useEffect(() => {
    // Skip if tags are already loaded
    if (tagsLoaded && selectedIcon) return;
    
    async function fetchTags() {
      setIsLoading(true);
      
      try {
        // Fetch all tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .eq('category', tagCategory)
          .order('id', { ascending: true });
        
        if (tagsError) {
          throw tagsError;
        }
        
        // Set default selected icon if available and not already set
        if (tagsData && tagsData.length > 0 && !selectedIcon) {
          setSelectedIcon(tagsData[0].icon);
        }
        
        // Fetch user tags if user is logged in
        let userTags: Tag[] = [];
        if (userId) {
          const { data: userTagsData, error: userTagsError } = await supabase
            .from('user_tags')
            .select('*')
            .eq('user_id', userId)
            .eq('category', tagCategory)
            .order('id', { ascending: true });
          
          if (userTagsError) {
            throw userTagsError;
          }
          
          userTags = userTagsData || [];
        }
        
        // Group tags by visual category
        const categories: Record<string, CategoryWithTags> = {};
        
        // Process all tags from database
        (tagsData || []).forEach(tag => {
          const visualCategory = ICON_CATEGORY_MAP[tag.icon] || ICON_CATEGORY_MAP.default;
          
          if (!categories[visualCategory]) {
            categories[visualCategory] = {
              category: visualCategory,
              title: CATEGORY_NAME_MAP[visualCategory] || visualCategory,
              tags: []
            };
          }
          
          // Check if this tag is already in the user's tags
          const isUserTag = userTags.some(userTag => 
            userTag.name === tag.name && userTag.icon === tag.icon
          );
          
          categories[visualCategory].tags.push({
            icon: tag.icon,
            name: tag.name,
            isUserTag,
            id: tag.id
          });
        });
        
        // Add user tags that aren't already in the system tags
        userTags.forEach(userTag => {
          const visualCategory = ICON_CATEGORY_MAP[userTag.icon] || ICON_CATEGORY_MAP.default;
          
          if (!categories[visualCategory]) {
            categories[visualCategory] = {
              category: visualCategory,
              title: CATEGORY_NAME_MAP[visualCategory] || visualCategory,
              tags: []
            };
          }
          
          // Check if this user tag is already added (from system tags)
          const tagAlreadyAdded = categories[visualCategory].tags.some(tag => 
            tag.name === userTag.name && tag.icon === userTag.icon
          );
          
          if (!tagAlreadyAdded) {
            categories[visualCategory].tags.push({
              icon: userTag.icon,
              name: userTag.name,
              isUserTag: true,
              id: userTag.id
            });
          }
        });
        
        // Convert categories object to array and filter out empty categories
        const categoriesArray = Object.values(categories)
          .filter(category => category.tags.length > 0);
        
        setCategoriesWithTags(categoriesArray);
        setTagsLoaded(true);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast.error(t('errorFetchingTags'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTags();
  }, [supabase, userId, tagCategory, t, tagsLoaded]);
  
  // Handle going back
  const handleBack = () => {
    router.back();
  };
  
  // Handle saving the new tag
  const handleSave = async () => {
    if (!userId) {
      toast.error(t('notLoggedIn'));
      return;
    }
    
    if (!tagName.trim()) {
      toast.error(t('tagNameRequired'));
      return;
    }
    
    if (tagName.length > 4) {
      toast.warning(t('tagNameTooLong'));
      return;
    }
    
    if (!selectedIcon) {
      toast.warning('Please select an icon');
      return;
    }
    
    try {
      // Create new tag with tag_id if available
      const { data, error } = await supabase
        .from('user_tags')
        .insert([
          {
            user_id: userId,
            name: tagName,
            icon: selectedIcon,
            category: tagCategory,
            tag_id: selectedTagId // Include the reference to the original tag
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success(t('tagAdded'));
      
      // Get the newly created tag
      const newTag = data?.[0];
      
      // Navigate back to the records page with the new tag information
      if (newTag) {
        // Construct the return URL with the new tag information
        const returnWithTagUrl = `${returnUrl}?newTagId=${newTag.id}&newTagName=${encodeURIComponent(newTag.name)}&newTagIcon=${encodeURIComponent(newTag.icon)}`;
        router.push(returnWithTagUrl);
      } else {
        // If for some reason we don't have the new tag data, just go back to the return URL
        router.push(returnUrl);
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error(t('errorSavingTag'));
    }
  };
  
  // Handle selecting a tag
  const handleSelectTag = (icon: string, tagId?: number) => {
    setSelectedIcon(icon);
    // If a tag ID is provided, store it for reference
    if (tagId) {
      setSelectedTagId(tagId);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full">{t('loading')}</div>;
  }
  
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white flex items-center justify-between px-4 py-3 shadow-sm">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label={t('back')}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">{t('addNewTag')}</h1>
        <button 
          onClick={handleSave}
          className="p-2 rounded-full hover:bg-emerald-100 text-emerald-600"
          aria-label={t('save')}
        >
          <Check size={24} />
        </button>
      </header>
      
      {/* Tag Input */}
      <div className="flex items-center p-4 bg-white border-b border-gray-200">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-teal-100 rounded-full mr-4">
          <div className="w-8 h-8">
            {selectedIcon && (
              <Icon name={`tags/${selectedIcon}`} size={32} className="icon-only" />
            )}
          </div>
        </div>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder={t('enterTagName')}
          maxLength={4}
          className="flex-1 p-2 border-none focus:outline-none focus:ring-0 text-base"
        />
      </div>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* Categories with Tags */}
        {categoriesWithTags.map((category) => (
          <div key={category.category} className="px-4 py-2">
            <h2 className="text-base font-medium mb-2">{category.title}</h2>
            <div className="bg-white rounded-md p-3">
              <div className="flex flex-wrap gap-2">
                {category.tags.map((tag, index) => (
                  <button 
                    key={`${tag.icon}-${tag.name}-${index}`}
                    onClick={() => handleSelectTag(tag.icon, tag.id)}
                    className="flex flex-col items-center w-16 h-16"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      tag.isUserTag ? 'bg-red-100 border-2 border-red-300' : 
                      selectedIcon === tag.icon ? 'bg-teal-200' : 'bg-gray-100'
                    }`}>
                      <Icon name={`tags/${tag.icon}`} size={24} className="icon-only" />
                    </div>
                    <span className="text-xs text-center truncate w-full">{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 