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
    async function fetchRecords() {
      try {
        setIsLoading(true);
        
        const supabase = createClient();
        
        // Get the first and last day of the selected month
        const startOfMonth = dayjs(date).startOf('month');
        const endOfMonth = dayjs(date).endOf('month');
        
        // Get all days in the month as string dates (YYYY-MM-DD)
        const daysInMonth = [];
        let currentDay = startOfMonth.clone();
        
        while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth, 'day')) {
          daysInMonth.push(currentDay.format('YYYY-MM-DD'));
          currentDay = currentDay.add(1, 'day');
        }
        
        // Initialize records for each day in the month
        const records = daysInMonth.map(day => ({
          date: day,
          income: 0,
          expense: 0
        }));
        
        // Query for records in the selected month
        const { data, error } = await supabase
          .from('records')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString());
        
        if (error) {
          console.error('Error fetching records:', error);
          setRecords([]);
          return;
        }
        
        // Aggregate records by day
        if (data && data.length > 0) {
          data.forEach(record => {
            const recordDate = dayjs(record.created_at).format('YYYY-MM-DD');
            const dayRecord = records.find(r => r.date === recordDate);
            
            if (dayRecord) {
              if (record.category === 'income') {
                dayRecord.income += record.amount;
              } else if (record.category === 'cost') {
                dayRecord.expense += record.amount;
              }
            }
          });
          
          setRecords(records);
        } else {
          setRecords([]);
        }
      } catch (error) {
        console.error('Error in fetchRecords:', error);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecords();
  }, [date, userId]);
  
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
      
      // Set chart options
      if (records.length > 0) {
        // Format the dates for display
        const formattedDates = records.map(record => {
          const day = dayjs(record.date).date();
          return day;
        });
        
        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: function(params: any) {
              const recordIndex = params[0].dataIndex;
              const record = records[recordIndex];
              const date = dayjs(record.date).format(locale === 'zh' ? 'YYYY年MM月DD日' : 'MMM DD, YYYY');
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
            data: formattedDates,
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
  }, [records, isLoading, t, locale]);
  
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
      
      // Cleanup chart when component unmounts
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
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
    </Wrapper>
  );
} 