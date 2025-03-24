'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Icon } from '@/app/components/ui/icon-component';
import { Overview } from './overview';
import { PieChart } from './pie-chart';
import { styled } from 'styled-components';
import SummarySection from './summary-section';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MonthSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const MonthButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #666;
  
  &:hover {
    color: #53a867;
  }
  
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const MonthDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const MonthText = styled.span`
  text-align: center;
  font-size: 18px;
  font-weight: bold;
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow: auto;
  background: #f5f5f5;
`;

const CalendarPopup = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  padding: 16px;
  width: 300px;
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const MonthItem = styled.button<{ isSelected: boolean, isDisabled: boolean }>`
  padding: 8px;
  text-align: center;
  background: ${props => props.isSelected ? '#53a867' : 'white'};
  color: ${props => props.isSelected ? 'white' : props.isDisabled ? '#ccc' : '#333'};
  border: 1px solid ${props => props.isSelected ? '#53a867' : '#eee'};
  border-radius: 4px;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background: ${props => props.isDisabled ? 'white' : props.isSelected ? '#53a867' : '#f5f5f5'};
  }
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const YearButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
`;

const YearText = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

export default function StatisticsContent({ userId, locale }: StatisticsContentProps) {
  const t = useTranslations('statistics');
  const [selected, setSelected] = useState<TabType>('overview');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(dayjs().year());
  
  const tabs = [
    { icon: 'overview', name: t('overview') },
    { icon: 'cost', name: t('expense') },
    { icon: 'income', name: t('income') }
  ];
  
  const goToPreviousMonth = () => {
    setSelectedDate(prev => prev.subtract(1, 'month'));
  };
  
  const goToNextMonth = () => {
    // Don't allow selecting future months
    setSelectedDate(prev => prev.add(1, 'month'));
  };
  
  const handleMonthSelect = (month: number) => {
    const newDate = dayjs().year(calendarYear).month(month);
    
    // Don't allow selecting future months
    if (newDate.isAfter(dayjs(), 'month')) return;
    
    setSelectedDate(newDate);
    setCalendarOpen(false);
  };
  
  const goToPreviousYear = () => {
    setCalendarYear(prev => prev - 1);
  };
  
  const goToNextYear = () => {
    if (calendarYear < dayjs().year()) {
      setCalendarYear(prev => prev + 1);
    }
  };
  
  const isCurrentMonth = selectedDate.format('YYYY-MM') === dayjs().format('YYYY-MM');
  const formattedMonth = selectedDate.format('YYYY-MM');
  
  const months = locale === 'zh' 
    ? ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="flex flex-col h-full">
      <Header>
        <MonthSelector>
          <MonthButton onClick={goToPreviousMonth}>
            <ChevronLeft size={20} />
          </MonthButton>
          
          <div style={{ position: 'relative' }}>
            <MonthDisplay onClick={() => setCalendarOpen(!calendarOpen)}>
              <MonthText>
                {locale === 'zh' 
                  ? `${selectedDate.year()}年${selectedDate.month() + 1}月` 
                  : selectedDate.format('MMMM YYYY')}
              </MonthText>
              <Calendar size={16} />
            </MonthDisplay>
            
            {/* <CalendarPopup isOpen={calendarOpen}>
              <YearSelector>
                <YearButton onClick={goToPreviousYear}>
                  <ChevronLeft size={16} />
                </YearButton>
                <YearText>{calendarYear}</YearText>
                <YearButton 
                  onClick={goToNextYear}
                  disabled={calendarYear >= dayjs().year()}
                >
                  <ChevronRight size={16} />
                </YearButton>
              </YearSelector>
              
              <MonthGrid>
                {months.map((month, index) => (
                  <MonthItem 
                    key={month}
                    isSelected={selectedDate.month() === index && selectedDate.year() === calendarYear}
                    isDisabled={calendarYear === dayjs().year() && index > dayjs().month()}
                    onClick={() => handleMonthSelect(index)}
                    disabled={calendarYear === dayjs().year() && index > dayjs().month()}
                  >
                    {locale === 'zh' ? `${index + 1}月` : month.slice(0, 3)}
                  </MonthItem>
                ))}
              </MonthGrid>
            </CalendarPopup> */}
          </div>
          
          <MonthButton onClick={goToNextMonth} disabled={isCurrentMonth}>
            <ChevronRight size={20} />
          </MonthButton>
        </MonthSelector>
      </Header>
      <SummarySection 
        userId={userId} 
        locale={locale} 
        month={formattedMonth}
      />
      <TabHeader>
        {tabs.map((tab) => (
          <li 
            onClick={() => {setSelected(tab.icon as TabType)}}
            key={tab.icon}
            className={selected === tab.icon ? 'selected' : 'unselected'}
          >
            <div>
              <Icon name={tab.icon} size={24} />
              <span>{tab.name}</span>
            </div>
          </li>
        ))}
      </TabHeader>
      <ContentWrapper>
        {selected === 'overview' && (
          <Overview 
            userId={userId} 
            locale={locale} 
            date={selectedDate.toDate()} 
          />
        )}
        {selected === 'cost' && (
          <PieChart 
            userId={userId} 
            locale={locale} 
            type="cost" 
            date={selectedDate.toDate()} 
          />
        )}
        {selected === 'income' && (
          <PieChart 
            userId={userId} 
            locale={locale} 
            type="income" 
            date={selectedDate.toDate()} 
          />
        )}
      </ContentWrapper>
    </div>
  );
} 