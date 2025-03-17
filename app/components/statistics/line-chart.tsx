'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/app/lib/supabase/client';
import dayjs from 'dayjs';
import { styled } from 'styled-components';

interface LineChartProps {
  userId: string;
  date: Date;
  locale: string;
}

interface DailyRecord {
  date: string;
  income: number;
  expense: number;
}

// Styled components to match the legacy styling
const Wrapper = styled.div`
  background: white;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChartWrapper = styled.div`
  position: relative;
  height: 400px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const ChartLegend = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  gap: 24px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  font-size: 14px;
  margin-top: 16px;
  
  > button {
    margin: 0 6px;
    padding: 4px 12px;
    color: #a0cac6;
    border: 1px solid #a0cac6;
    border-radius: 4px;
    outline: none;
    background: #fff;
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #999;
`;

export function LineChart({ userId, date, locale }: LineChartProps) {
  const t = useTranslations('statistics');
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(date));
  const [index, setIndex] = useState(0);
  const count = 7; // Number of days to display
  const chartRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  
  // Colors for the chart
  const colors = {
    income: '#333',
    expense: '#f56c6c',
    grid: '#e0e0e0'
  };
  
  useEffect(() => {
    fetchRecords();
  }, [currentDate, userId]);
  
  const fetchRecords = async () => {
    setIsLoading(true);
    
    try {
      // Calculate date range
      const endDate = dayjs(currentDate);
      const startDate = endDate.subtract(count - 1, 'day');
      
      // Fetch income records
      const { data: incomeData, error: incomeError } = await supabase
        .from('records')
        .select('amount, created_at')
        .eq('user_id', userId)
        .eq('category', 'income')
        .gte('created_at', startDate.startOf('day').toISOString())
        .lte('created_at', endDate.endOf('day').toISOString());
      
      if (incomeError) throw incomeError;
      
      // Fetch expense records
      const { data: expenseData, error: expenseError } = await supabase
        .from('records')
        .select('amount, created_at')
        .eq('user_id', userId)
        .eq('category', 'cost')
        .gte('created_at', startDate.startOf('day').toISOString())
        .lte('created_at', endDate.endOf('day').toISOString());
      
      if (expenseError) throw expenseError;
      
      // Process data by day
      const dailyRecords: DailyRecord[] = [];
      
      for (let i = 0; i < count; i++) {
        const day = startDate.add(i, 'day');
        const dayStr = day.format('MM-DD');
        
        // Calculate income for this day
        const dayIncome = incomeData
          .filter(record => dayjs(record.created_at).format('MM-DD') === dayStr)
          .reduce((sum, record) => sum + Number(record.amount), 0);
        
        // Calculate expenses for this day
        const dayExpense = expenseData
          .filter(record => dayjs(record.created_at).format('MM-DD') === dayStr)
          .reduce((sum, record) => sum + Number(record.amount), 0);
        
        dailyRecords.push({
          date: dayStr,
          income: dayIncome,
          expense: dayExpense
        });
      }
      
      setRecords(dailyRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get previous 7 days
  const getPrevData = () => {
    if (isLoading) return;
    const newDate = dayjs(currentDate).subtract(count, 'day').toDate();
    setCurrentDate(newDate);
    setIndex(index - 1);
  };
  
  // Get next 7 days
  const getNextData = () => {
    if (isLoading) return;
    const newDate = dayjs(currentDate).add(count, 'day').toDate();
    setCurrentDate(newDate);
    setIndex(index + 1);
  };
  
  // Get current 7 days
  const getCurrentData = () => {
    if (isLoading) return;
    setCurrentDate(new Date(date));
    setIndex(0);
  };
  
  if (isLoading) {
    return <NoData>{t('loading')}</NoData>;
  }
  
  if (records.length === 0) {
    return <NoData>{t('noData')}</NoData>;
  }
  
  // Calculate max value for y-axis scale
  const maxIncome = Math.max(...records.map(r => r.income));
  const maxExpense = Math.max(...records.map(r => r.expense));
  const maxValue = Math.max(maxIncome, maxExpense);
  const yAxisMax = maxValue === 0 ? 100 : Math.ceil(maxValue / 1000) * 1000;
  
  // Calculate chart dimensions
  const chartWidth = 100;
  const chartHeight = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };
  
  // Generate y-axis ticks
  const yAxisTicks = [];
  const numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    yAxisTicks.push(yAxisMax * i / numTicks);
  }
  
  // Generate points for the line
  const generatePoints = (key: 'income' | 'expense') => {
    const points = records.map((record, i) => {
      const x = padding.left + (chartWidth - padding.left - padding.right) * i / (records.length - 1);
      const y = chartHeight - padding.bottom - (chartHeight - padding.top - padding.bottom) * record[key] / yAxisMax;
      return `${x},${y}`;
    });
    return points.join(' ');
  };
  
  return (
    <Wrapper>
      <ChartLegend>
        <LegendItem>
          <LegendColor color={colors.income} />
          <span>{t('income')}</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color={colors.expense} />
          <span>{t('expense')}</span>
        </LegendItem>
      </ChartLegend>
      
      <ChartWrapper ref={chartRef}>
        <ChartSvg viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Y-axis grid lines */}
          {yAxisTicks.map((tick, i) => (
            <g key={`y-tick-${i}`}>
              <line
                x1={padding.left}
                y1={chartHeight - padding.bottom - (chartHeight - padding.top - padding.bottom) * tick / yAxisMax}
                x2={chartWidth - padding.right}
                y2={chartHeight - padding.bottom - (chartHeight - padding.top - padding.bottom) * tick / yAxisMax}
                stroke={colors.grid}
                strokeWidth="0.5"
              />
              <text
                x={0}
                y={chartHeight - padding.bottom - (chartHeight - padding.top - padding.bottom) * tick / yAxisMax}
                fontSize="3"
                textAnchor="start"
                dominantBaseline="middle"
              >
                {tick}
              </text>
            </g>
          ))}
          
          {/* X-axis labels */}
          {records.map((record, i) => (
            <text
              key={`x-label-${i}`}
              x={padding.left + (chartWidth - padding.left - padding.right) * i / (records.length - 1)}
              y={chartHeight - padding.bottom / 2}
              fontSize="3"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {record.date}
            </text>
          ))}
          
          {/* Income line */}
          <polyline
            points={generatePoints('income')}
            fill="none"
            stroke={colors.income}
            strokeWidth="0.5"
          />
          
          {/* Income points */}
          {records.map((record, i) => (
            <circle
              key={`income-point-${i}`}
              cx={padding.left + (chartWidth - padding.left - padding.right) * i / (records.length - 1)}
              cy={chartHeight - padding.bottom - (chartHeight - padding.top - padding.bottom) * record.income / yAxisMax}
              r="1"
              fill={colors.income}
            />
          ))}
          
          {/* Expense line */}
          <polyline
            points={generatePoints('expense')}
            fill="none"
            stroke={colors.expense}
            strokeWidth="0.5"
          />
          
          {/* Expense points */}
          {records.map((record, i) => (
            <circle
              key={`expense-point-${i}`}
              cx={padding.left + (chartWidth - padding.left - padding.right) * i / (records.length - 1)}
              cy={chartHeight - padding.bottom - (chartHeight - padding.top - padding.bottom) * record.expense / yAxisMax}
              r="1"
              fill={colors.expense}
            />
          ))}
        </ChartSvg>
      </ChartWrapper>
      
      <ButtonWrapper>
        <button onClick={getPrevData}>{t('previousDays', { count })}</button>
        <button onClick={getCurrentData}>{t('currentDay')}</button>
        <button onClick={getNextData}>{t('nextDays', { count })}</button>
      </ButtonWrapper>
    </Wrapper>
  );
} 