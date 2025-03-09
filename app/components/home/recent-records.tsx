'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/app/lib/supabase/client';
import dayjs from 'dayjs';
import Decimal from 'decimal.js';

interface RecordItem {
  id: string;
  user_id: string;
  amount: number;
  category: 'income' | 'cost';
  tag_id: number;
  created_at: string;
}

interface Tag {
  id: number;
  name: string;
  icon: string;
}

interface RecentRecordsProps {
  records: RecordItem[];
}

interface FormattedRecord {
  tagId: number;
  amount: number;
  category: 'income' | 'cost';
  icon: string;
  name: string;
  time: string;
}

interface FormattedRecordGroup {
  date: string;
  list: FormattedRecord[];
}

export function RecentRecords({ records }: RecentRecordsProps) {
  const t = useTranslations('home');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  // Fetch tags from Supabase
  useEffect(() => {
    async function fetchTags() {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('tags')
        .select('*');
      
      if (error) {
        console.error('Error fetching tags:', error);
      } else {
        setTags(data || []);
      }
      
      setIsLoading(false);
    }
    
    fetchTags();
  }, [supabase]);
  
  // Format records by date
  const formatRecordsByDate = () => {
    const formatObj: Record<string, FormattedRecord[]> = {};
    
    // Group records by date and add tag information
    records.forEach((record) => {
      const { tag_id, category, amount, created_at } = record;
      
      // Find matching tag
      const matchedTag = tags.find(tag => tag.id === tag_id) || { icon: '', name: '' };
      
      // Format date
      const date = created_at.slice(0, 10);
      const dateObj = dayjs(created_at);
      
      // Create formatted record
      const formattedRecord: FormattedRecord = {
        tagId: tag_id,
        category,
        amount,
        time: dateObj.format('HH:mm'),
        icon: matchedTag.icon,
        name: matchedTag.name
      };
      
      // Add to date group
      if (date in formatObj) {
        formatObj[date].unshift(formattedRecord);
      } else {
        formatObj[date] = [formattedRecord];
      }
    });
    
    // Convert to array format
    const formatList: FormattedRecordGroup[] = [];
    for (const key in formatObj) {
      formatList.push({
        date: dayjs(key).format('MM月DD日'),
        list: formatObj[key]
      });
    }
    
    return formatList;
  };
  
  const formattedRecords = formatRecordsByDate();
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-pulse">{t('loading')}</div>
      </div>
    );
  }
  
  if (formattedRecords.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        {t('noRecords')}
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap justify-center w-full">
      {formattedRecords.map((group, groupIndex) => (
        <div key={groupIndex} className="w-full mx-4 mb-6">
          {/* Date header with totals */}
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="text-emerald-500">{group.date}</div>
            <div className="text-gray-400">
              <span className="mr-3">
                {t('expenses')} ￥
                {group.list
                  .reduce((total, item) => 
                    item.category === 'cost' ? total.plus(item.amount) : total, 
                    new Decimal(0)
                  ).toNumber()}
              </span>
              <span>
                {t('income')} ￥
                {group.list
                  .reduce((total, item) => 
                    item.category === 'income' ? total.plus(item.amount) : total, 
                    new Decimal(0)
                  ).toNumber()}
              </span>
            </div>
          </div>
          
          {/* Record list */}
          <ul className="space-y-2">
            {group.list.map((record, recordIndex) => (
              <li 
                key={recordIndex}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full mr-2">
                    {record.icon || '💰'}
                  </span>
                  <span>{record.name || t('unnamed')}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold">
                    {record.category === 'income' ? '' : '-'}￥{record.amount}
                  </span>
                  <span className="text-sm text-gray-400">{record.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
} 