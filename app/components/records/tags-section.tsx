'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Icon, iconFileMap } from '@/app/components/ui/icon';

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
  const filteredTags = tags.filter(tag => tag.category === category).filter((tag)=>!!iconFileMap[tag.name]);
  
  const handleTagClick = (tagId: number) => {
    if (value === tagId) {
      onChange(-1);
    } else {
      onChange(tagId);
    }
  };

  return (
    <section className="flex-grow flex flex-col overflow-auto bg-[#f9faf5] p-4 pb-3">
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
              <Icon name={`tags/${tag.name}`} size={40} />
            </div>
          </li>
        ))}
        <li className="w-[calc(20%-8px)] m-1 mt-1 p-2 rounded-lg flex flex-col items-center justify-start text-sm text-center">
          <Link 
            href={`/${locale}/tags/add`}
            className="w-10 h-10 flex items-center justify-center text-2xl mb-1 text-[#f2c841]"
          >
            +
          </Link>
        </li>
      </ul>
    </section>
  );
} 