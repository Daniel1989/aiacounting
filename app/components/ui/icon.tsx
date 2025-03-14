'use client';

import Image from 'next/image';
import { cn } from '@/app/lib/utils';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

// Map of Chinese icon names to their corresponding file names
export const iconFileMap: Record<string, string> = {
  // Transportation
  '婴儿车': 'babycar',
  '公交车': 'bus',
  '出租车': 'chuzuche',
  '电动车': 'diandongche',
  '飞机': 'feiji',
  '公交': 'gongjiao',
  '加油': 'jiayou',
  '救护车': 'jiuhuche',
  '出租': 'taxi',
  '火车': 'train',
  '小车': 'xiaoche',
  '游轮': 'youlun',

  // Food & Drink
  '餐饮': 'canyin',
  '食物': 'canyin',
  '水果': 'fruit',
  '冰淇淋': 'ice-cream',
  '蔬菜': 'shucai',
  '饮料': 'yinliao',

  // Shopping & Clothing
  '包': 'bag',
  '衣服': 'clothes',
  '牛仔裤': 'jeans',
  '口红': 'kouhong',
  '裤子': 'kuzi',
  '礼物': 'liwu',
  '购物': 'shop',
  '商场': 'shopping',
  '鞋子': 'shoes',
  '玩具': 'wanju',

  // Home & Living
  '电脑': 'diannao',
  '房租': 'fangzu',
  '笔记本': 'laptop',
  '手机': 'phone',
  '日用品': 'riyong',
  '沙发': 'shafa',
  '水电': 'shuidian',
  '工具': 'tools',

  // Health & Medical
  '病床': 'bingchuang',
  '健康': 'health',
  '心电图': 'xindiantu',
  '牙齿': 'yachi',
  '药丸': 'yaowan',
  '医生': 'yisheng',
  '医院': 'yiyuan',
  '针': 'zhen',

  // Education & Work
  '书籍': 'book',
  '教育': 'education',
  '工作': 'job',
  '老师': 'laoshi',
  '练习册': 'lianxice',
  '书本': 'shuben',
  '学校': 'xuexiao',

  // Entertainment & Leisure
  '电影': 'dianying',
  '健身': 'fitness',
  '游戏': 'game',
  '篮球': 'lanqiu',
  '电影院': 'movie',
  '肌肉': 'muscle',
  '派对': 'party',
  '游泳': 'swimming',
  '票': 'ticket',
  '儿童玩具': 'toy',
  '旅行': 'travel',
  '旅游': 'lvyou',
  '音乐': 'yinyue',
  '娱乐': 'yule',

  // Pets
  '宠物': 'chongwu',

  // Finance & Income
  '银行': 'bank',
  '报销': 'baoxiao',
  '补助': 'buzhu',
  '电费': 'electric',
  '分红': 'fenhong',
  '燃气': 'gas',
  '工资': 'gongji',
  '红包': 'hongbao',
  '投资': 'invest',
  '奖金': 'jiangjin',
  '借款': 'jiekuan',
  '奶瓶': 'naiping',
  '股票': 'stock',
  '钱包': 'wallet',
  '违章': 'weizhang',
};

export function Icon({ name, className, size = 40 }: IconProps) {
  // For tag icons, we use the public directory
  if (name.startsWith('tags/')) {
    const tagName = name.split('/')[1];
    // Get the file name from the map or use the tag name directly
    const fileName = iconFileMap[tagName];
    if (!fileName) {
      return null;
    }
    
    const isIconOnly = className?.includes('icon-only');
    
    return (
      <div className={cn("flex items-center", isIconOnly ? "" : "flex-col")}>
        <Image
          src={`/icons/tags/${fileName}.svg`}
          alt={tagName}
          width={size}
          height={size}
          className={cn('inline-block', className)}
          onError={(e) => {
            console.error(`Error loading icon for ${tagName}:`, e);
          }}
        />
        {!isIconOnly && <span className="text-xs">{tagName}</span>}
      </div>
    );
  }
  return null;
} 