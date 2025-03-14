'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Icon, iconFileMap } from '@/app/components/ui/icon';
import { Plus } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
  icon: string;
  category: 'income' | 'cost';
}

interface TagsSectionProps {
  value: number;
  category: 'income' | 'cost';
  tags: Tag[];
  onChange: (tagId: number) => void;
}

export function TagsSection({ value, category, tags, onChange }: TagsSectionProps) {
  const t = useTranslations('records');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const filteredTags = tags.filter(tag => tag.category === category);
  
  console.log("filteredTags", filteredTags)
  // Create the return URL (current page)
  const returnUrl = pathname;
  
  const handleTagClick = (tagId: number) => {
    if (value === tagId) {
      onChange(-1);
    } else {
      onChange(tagId);
    }
  };

  return (
    <section className="bg-[#f9faf5] p-4 pb-3">
      <ul className="flex flex-wrap justify-start">
        {filteredTags.map(tag => (
          <li 
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`w-[calc(20%-8px)] m-1 mt-1 p-2 rounded-lg flex flex-col items-center justify-start text-sm text-center ${
              value === tag.id ? 'bg-[#a0ded1] border-2 border-[#95c8be]' : 'border-2 border-transparent'
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mb-1">
              <Icon name={`tags/${tag.icon}`} size={40} />
            </div>
          </li>
        ))}
        <li className="w-[calc(20%-8px)] m-1 mt-1 p-2 rounded-lg flex flex-col items-center justify-start text-sm text-center">
          <Link 
            href={`/${locale}/tags/new?category=${category}&returnUrl=${returnUrl}`}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full mb-1 text-gray-600 hover:bg-gray-200"
          >
            <Plus size={24} />
          </Link>
        </li>
      </ul>
    </section>
  );
} 