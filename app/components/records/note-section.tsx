'use client';

import { useTranslations } from 'next-intl';

interface NoteSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteSection({ value, onChange }: NoteSectionProps) {
  const t = useTranslations('records');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <section className="bg-white p-4 text-sm">
      <label className="flex items-center">
        <span className="mr-4 whitespace-nowrap">{t('note')}</span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={t('notePlaceholder')}
          className="h-8 flex-1 border-none bg-transparent outline-none"
        />
      </label>
    </section>
  );
} 