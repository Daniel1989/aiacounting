'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/app/lib/supabase/client';
import dayjs from 'dayjs';
import { styled } from 'styled-components';
import * as echarts from 'echarts';

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
  height: 300px;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  const chartInstance = useRef<echarts.ECharts | null>(null);
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

  // Initialize and update ECharts
  useEffect(() => {
    // Initialize chart
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // Show loading state
      if (isLoading) {
        chartInstance.current.showLoading();
        return;
      } else {
        chartInstance.current.hideLoading();
      }
      console.log(records);
      // Set chart options
      if (records.length > 0) {
        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: function(params: any) {
              const date = params[0].name;
              let result = `${date}<br/>`;
              
              params.forEach((param: any) => {
                const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`;
                const value = param.value || 0;
                result += `${marker} ${param.seriesName}: ¥${value.toFixed(2)}<br/>`;
              });
              
              return result;
            }
          },
          legend: {
            show: false
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: records.map(record => record.date),
            axisLine: {
              lineStyle: {
                color: colors.grid
              }
            },
            axisLabel: {
              color: '#666'
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                color: colors.grid,
                type: 'dashed'
              }
            },
            axisLabel: {
              color: '#666',
              formatter: (value: number) => {
                return value.toFixed(0);
              }
            }
          },
          series: [
            {
              name: t('income'),
              type: 'line',
              stack: 'Total',
              data: records.map(record => record.income),
              symbol: 'circle',
              symbolSize: 8,
              itemStyle: {
                color: colors.income
              },
              lineStyle: {
                width: 2,
                color: colors.income
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(51, 51, 51, 0.2)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(51, 51, 51, 0)'
                    }
                  ]
                }
              }
            },
            {
              name: t('expense'),
              type: 'line',
              stack: 'Total',
              data: records.map(record => record.expense),
              symbol: 'circle',
              symbolSize: 8,
              itemStyle: {
                color: colors.expense
              },
              lineStyle: {
                width: 2,
                color: colors.expense
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(245, 108, 108, 0.2)'
                    },
                    {
                      offset: 1,
                      color: 'rgba(245, 108, 108, 0)'
                    }
                  ]
                }
              }
            }
          ]
        };
        
        chartInstance.current.setOption(option);
      }
    }
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [records, isLoading, t]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Force resize after a short delay to ensure the container has proper dimensions
    const timer = setTimeout(() => {
      handleResize();
    }, 200);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);
  
  if (isLoading) {
    return <NoData>{t('loading')}</NoData>;
  }
  
  if (records.length === 0) {
    return <NoData>{t('noData')}</NoData>;
  }
  
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
      
      <ChartWrapper ref={chartRef} style={{ minHeight: '300px' }} />
      
      <ButtonWrapper>
        <button onClick={getPrevData}>{t('previousDays', { count })}</button>
        <button onClick={getCurrentData}>{t('currentDay')}</button>
        <button onClick={getNextData}>{t('nextDays', { count })}</button>
      </ButtonWrapper>
    </Wrapper>
  );
} 