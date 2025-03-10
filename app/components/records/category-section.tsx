'use client';

import { useTranslations } from 'next-intl';

interface CategorySectionProps {
  value: 'income' | 'cost';
  onChange: (category: 'income' | 'cost') => void;
}

export function CategorySection({ value, onChange }: CategorySectionProps) {
  const t = useTranslations('records');
  
  const categories: { key: 'income' | 'cost'; label: string }[] = [
    { key: 'income', label: t('income') },
    { key: 'cost', label: t('expense') }
  ];

  return (
    <ul className="flex text-sm bg-[#e8ecef] p-0.5 rounded">
      {categories.map(category => (
        <li
          key={category.key}
          className={`px-2 py-0.5 rounded cursor-pointer ${value === category.key ? 'bg-white' : ''}`}
          onClick={() => onChange(category.key)}
        >
          {category.label}
        </li>
      ))}
    </ul>
  );
} 