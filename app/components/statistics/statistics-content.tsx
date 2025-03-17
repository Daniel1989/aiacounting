'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Icon } from '@/app/components/ui/icon';
import { Overview } from './overview';
import { PieChart } from './pie-chart';
import { styled } from 'styled-components';

type TabType = 'overview' | 'cost' | 'income';

interface StatisticsContentProps {
  userId: string;
  locale: string;
}

// Styled components to match the legacy styling
const TabHeader = styled.ul`
  display: flex;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  
  > li {
    width: 33.33%;
    text-align: center;
    padding: 16px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    
    &.selected {
      color: #53a867;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: #53a867;
      }
    }
    
    > div {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      > span {
        font-size: 12px;
        margin-top: 4px;
      }
    }
  }
`;

const Header = styled.header`
  text-align: center;
  font-size: 18px;
  line-height: 20px;
  padding: 16px;
  background: white;
  font-weight: bold;
`;

export default function StatisticsContent({ userId, locale }: StatisticsContentProps) {
  const t = useTranslations('statistics');
  const [selected, setSelected] = useState<TabType>('overview');
  const [current] = useState(new Date());
  
  const tabs = [
    { icon: 'overview', name: t('overview') },
    { icon: 'cost', name: t('expense') },
    { icon: 'income', name: t('income') }
  ];
  
  return (
    <div className="flex flex-col h-full">
      <Header>{dayjs(current).format('YYYY年MM月')}</Header>
      <TabHeader>
        {tabs.map((tab) => (
          <li 
            onClick={() => {setSelected(tab.icon as TabType)}}
            key={tab.icon}
            className={selected === tab.icon ? 'selected' : ''}
          >
            <div>
              <Icon name={tab.icon} size={24} />
              {selected === tab.icon && <span>{tab.name}</span>}
            </div>
          </li>
        ))}
      </TabHeader>
      <div className="flex-1 overflow-auto">
        {selected === 'overview' ? (
          <Overview userId={userId} date={current} locale={locale} />
        ) : (
          <PieChart userId={userId} date={current} type={selected} locale={locale} />
        )}
      </div>
    </div>
  );
} 