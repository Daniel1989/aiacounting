'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/app/lib/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Default tag names for filtering
const DEFAULT_COST_TAGS = ['房租', '水电', '交通', '学校', '日用', '餐饮', '购物', '娱乐', '旅游', '电影', '宠物'];
const DEFAULT_INCOME_TAGS = ['工资', '红包', '借款', '投资', '分红'];

interface TagManagementProps {
  userId: string | null;
  locale: string;
}

interface Tag {
  id: number;
  name: string;
  icon: string;
  category: 'income' | 'cost';
  isDefault?: boolean;
}

interface EditingTag extends Tag {
  isNew?: boolean;
}

const DEFAULT_ICONS = {
  income: ['💰', '🧧', '💸', '📈', '💵', '💴', '💶', '💷', '🏦', '💳'],
  cost: ['🏠', '💡', '🚗', '🏫', '🧴', '🍔', '🛍️', '🎮', '✈️', '🎬', '🐱', '📱', '👕', '💊', '🏥']
};

export function TagManagement({ userId, locale }: TagManagementProps) {
  const t = useTranslations('settings');
  const [defaultTags, setDefaultTags] = useState<Tag[]>([]);
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'income' | 'cost'>('cost');
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  
  const supabase = createClient();
  
  // Fetch tags
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
          return (tag.category === 'cost' && DEFAULT_COST_TAGS.includes(tag.name)) ||
                 (tag.category === 'income' && DEFAULT_INCOME_TAGS.includes(tag.name));
        }).map(tag => ({
          ...tag,
          isDefault: true
        })) || [];
        
        setDefaultTags(filteredDefaultTags);
        
        // Fetch user tags if user is logged in
        if (userId) {
          const { data: userTagsData, error: userTagsError } = await supabase
            .from('user_tags')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: true });
          
          if (userTagsError) {
            throw userTagsError;
          }
          
          setUserTags(userTagsData || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast.error(t('errorFetchingTags'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTags();
  }, [supabase, userId, t]);
  
  // Filter tags by category
  const filteredDefaultTags = defaultTags.filter(tag => tag.category === activeCategory);
  const filteredUserTags = userTags.filter(tag => tag.category === activeCategory);
  
  // Start editing a tag
  const handleEdit = (tag: Tag) => {
    setEditingTag({ ...tag });
  };
  
  // Start creating a new tag
  const handleAddNew = () => {
    setEditingTag({
      id: -1,
      name: '',
      icon: DEFAULT_ICONS[activeCategory][0],
      category: activeCategory,
      isNew: true
    });
  };
  
  // Save tag (create or update)
  const handleSave = async () => {
    if (!editingTag || !userId) return;
    
    if (!editingTag.name.trim()) {
      toast.error(t('tagNameRequired'));
      return;
    }
    
    try {
      if (editingTag.isNew) {
        // Create new tag
        const { data, error } = await supabase
          .from('user_tags')
          .insert([
            {
              user_id: userId,
              name: editingTag.name,
              icon: editingTag.icon,
              category: editingTag.category
            }
          ])
          .select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setUserTags([...userTags, data[0] as Tag]);
          toast.success(t('tagAdded'));
        }
      } else {
        // Update existing tag
        const { error } = await supabase
          .from('user_tags')
          .update({
            name: editingTag.name,
            icon: editingTag.icon
          })
          .eq('id', editingTag.id)
          .eq('user_id', userId);
        
        if (error) throw error;
        
        // Update local state
        setUserTags(userTags.map(tag => 
          tag.id === editingTag.id ? { ...tag, name: editingTag.name, icon: editingTag.icon } : tag
        ));
        
        toast.success(t('tagUpdated'));
      }
      
      // Clear editing state
      setEditingTag(null);
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error(t('errorSavingTag'));
    }
  };
  
  // Delete a tag
  const handleDelete = async (tagId: number) => {
    if (!userId) return;
    
    if (!confirm(t('confirmDeleteTag'))) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUserTags(userTags.filter(tag => tag.id !== tagId));
      toast.success(t('tagDeleted'));
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error(t('errorDeletingTag'));
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    setEditingTag(null);
  };
  
  if (isLoading) {
    return <div className="animate-pulse p-4">{t('loading')}</div>;
  }
  
  if (!userId) {
    return <div className="p-4">{t('loginToManageTags')}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md ${
            activeCategory === 'cost' 
              ? 'bg-red-100 text-red-700 font-medium' 
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveCategory('cost')}
        >
          {t('expenses')}
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            activeCategory === 'income' 
              ? 'bg-green-100 text-green-700 font-medium' 
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveCategory('income')}
        >
          {t('income')}
        </button>
      </div>
      
      {/* Default Tags Section */}
      <div>
        <h3 className="font-medium text-gray-700 mb-2">{t('defaultTags')}</h3>
        <div className="space-y-2">
          {filteredDefaultTags.map(tag => (
            <div key={tag.id} className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{tag.icon}</span>
                <span>{tag.name}</span>
              </div>
            </div>
          ))}
          
          {filteredDefaultTags.length === 0 && (
            <div className="text-center py-3 text-gray-500">
              {t('noTagsFound')}
            </div>
          )}
        </div>
      </div>
      
      {/* User Tags Section */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-700 mb-2">{t('customTags')}</h3>
        <div className="space-y-2">
          {filteredUserTags.map(tag => (
            <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{tag.icon}</span>
                <span>{tag.name}</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(tag)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
                  aria-label={t('edit')}
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(tag.id)}
                  className="p-1.5 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50"
                  aria-label={t('delete')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredUserTags.length === 0 && (
            <div className="text-center py-3 text-gray-500">
              {t('noCustomTagsFound')}
            </div>
          )}
        </div>
      </div>
      
      {/* Add new tag button - now links to the dedicated page */}
      <Link
        href={`/${locale}/tags/new`}
        className="mt-4 flex items-center justify-center w-full py-2 px-4 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100"
      >
        <Plus size={18} className="mr-2" />
        {t('addNewTag')}
      </Link>
      
      {/* Edit tag form */}
      {editingTag && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white">
          <h3 className="font-medium mb-3">
            {t('editTag')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tagName')}
              </label>
              <input
                type="text"
                value={editingTag.name}
                onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('enterTagName')}
                maxLength={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('icon')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {DEFAULT_ICONS[activeCategory].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setEditingTag({...editingTag, icon})}
                    className={`text-2xl p-2 rounded-md ${
                      editingTag.icon === icon 
                        ? 'bg-emerald-100 border-2 border-emerald-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                {t('save')}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 