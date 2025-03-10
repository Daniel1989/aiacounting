'use client';

import { Icon } from '@/app/components/ui/icon';

export function TestIcons() {
  // Sample tag names in both English and Chinese
  const sampleTags = [
    { english: 'canyin', chinese: '餐饮' },
    { english: 'yule', chinese: '娱乐' },
    { english: 'gongji', chinese: '工资' },
    { english: 'yifu', chinese: '衣服' },
    { english: 'jiangjin', chinese: '奖金' },
    { english: 'fenhong', chinese: '分红' },
    { english: 'travel', chinese: '旅行' },
    { english: 'education', chinese: '教育' },
    { english: 'yiyuan', chinese: '医院' },
    { english: 'shopping', chinese: '商场' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Icon Test</h2>
      
      <h3 className="text-lg font-semibold mb-2">English Icon Names (Original)</h3>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {sampleTags.map(tag => (
          <div key={tag.english} className="flex flex-col items-center">
            <Icon name={`tags/${tag.english}`} size={40} />
            <span className="mt-2 text-sm">{tag.english}</span>
          </div>
        ))}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Chinese Icon Names (New)</h3>
      <div className="grid grid-cols-5 gap-4">
        {sampleTags.map(tag => (
          <div key={tag.chinese} className="flex flex-col items-center">
            <Icon name={`tags/${tag.chinese}`} size={40} />
            <span className="mt-2 text-sm">{tag.chinese}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 