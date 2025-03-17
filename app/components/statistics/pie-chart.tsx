'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/app/lib/supabase/client';
import dayjs from 'dayjs';
import { styled } from 'styled-components';
import { Icon } from '@/app/components/ui/icon-component';
import * as echarts from 'echarts';

interface PieChartProps {
  userId: string;
  date: Date;
  type: 'cost' | 'income';
  locale: string;
}

interface TagSummary {
  tagId: number;
  tagName: string;
  tagIcon: string;
  amount: number;
  percentage: number;
  color: string;
}

interface RecordWithTag {
  amount: number;
  tags: {
    id: string | number;
    name: string;
    icon: string;
    type: string;
    category: string;
  } | null;
}

// Styled components to match the legacy styling
const Container = styled.div`
  padding: 16px;
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChartHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
  
  > .title {
    font-size: 16px;
    color: #53a867;
    margin-bottom: 8px;
  }
  
  > .total {
    font-size: 28px;
    font-weight: bold;
    color: #53a867;
  }
  
  > .catalog-button {
    margin-top: 8px;
    padding: 4px 12px;
    background-color: #f5f5f5;
    border-radius: 16px;
    display: inline-block;
    font-size: 12px;
    color: #999;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin: 24px 0;
`;

const TagList = styled.ul`
  margin-top: 24px;
`;

const TagItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  > .color-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 8px;
  }
  
  > .tag-info {
    flex: 1;
    display: flex;
    align-items: center;
    
    > .icon {
      margin-right: 8px;
    }
    
    > .name {
      font-size: 14px;
    }
  }
  
  > .amount-info {
    text-align: right;
    
    > .amount {
      font-size: 16px;
      font-weight: bold;
    }
    
    > .percentage {
      font-size: 12px;
      color: #999;
    }
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #999;
`;

// Predefined colors for the chart segments
const chartColors = [
  '#e74c3c', // Red
  '#34495e', // Dark Blue
  '#2ecc71', // Green
  '#3498db', // Blue
  '#f39c12', // Orange
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#e67e22', // Dark Orange
  '#95a5a6', // Gray
  '#16a085', // Dark Turquoise
  '#d35400', // Darker Orange
  '#7f8c8d', // Darker Gray
];

export function PieChart({ userId, date, type, locale }: PieChartProps) {
  const t = useTranslations('statistics');
  const [tagSummaries, setTagSummaries] = useState<TagSummary[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    async function fetchTagSummaries() {
      setIsLoading(true);
      
      try {
        const supabase = createClient();
        const startOfMonth = dayjs(date).startOf('month').toISOString();
        const endOfMonth = dayjs(date).endOf('month').toISOString();
        
        // Fetch records with tag information
        const { data: recordsData, error: recordsError } = await supabase
          .from('records')
          .select(`
            amount,
            tags:tag_id (
              id,
              name,
              icon,
              category
            )
          `)
          .eq('user_id', userId)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);
        
        if (recordsError) throw recordsError;
        
        // Process records to get tag summaries
        const tagMap = new Map<number, { tagId: number; tagName: string; tagIcon: string; amount: number }>();
        let filteredRecords = 0;
        
        if (recordsData) {
          // Filter records by type based on tag type
          const filteredData = recordsData.filter((record: any) => {
            return record.tags?.category === (type === 'cost' ? 'cost' : 'income');
          });
          
          filteredRecords = filteredData.length;
          
          filteredData.forEach((record: any) => {
            if (!record.tags) return;
            
            const tagId = Number(record.tags.id);
            const amount = Number(record.amount);
            
            if (tagMap.has(tagId)) {
              const existing = tagMap.get(tagId)!;
              tagMap.set(tagId, {
                ...existing,
                amount: existing.amount + amount
              });
            } else {
              tagMap.set(tagId, {
                tagId,
                tagName: record.tags.name,
                tagIcon: record.tags.icon || 'default',
                amount
              });
            }
          });
        }
        
        // Calculate total amount
        const total = Array.from(tagMap.values()).reduce((sum, item) => sum + item.amount, 0);
        setTotalAmount(total);
        setRecordCount(filteredRecords);
        
        // Convert to array and calculate percentages
        const summaries = Array.from(tagMap.values())
          .map((item, index) => ({
            ...item,
            percentage: total > 0 ? (item.amount / total) * 100 : 0,
            color: chartColors[index % chartColors.length]
          }))
          .sort((a, b) => b.amount - a.amount);
        
        setTagSummaries(summaries);
      } catch (error) {
        console.error('Error fetching tag summaries:', error);
        setTagSummaries([]);
        setTotalAmount(0);
        setRecordCount(0);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTagSummaries();
  }, [userId, date, type]);
  
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
      if (tagSummaries.length > 0) {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          color: chartColors,
          series: [
            {
              name: type === 'cost' ? t('expense') : t('income'),
              type: 'pie',
              radius: ['30%', '55%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: '{b}: {d}%'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: true
              },
              data: tagSummaries.map(tag => ({
                name: tag.tagName,
                value: tag.amount
              }))
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
  }, [tagSummaries, isLoading, type, t]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  if (isLoading) {
    return <NoData>{t('loading')}</NoData>;
  }
  
  if (tagSummaries.length === 0) {
    return <NoData>{t('noData')}</NoData>;
  }
  
  return (
    <Container>
      <ChartHeader>
        <div className="title">{type === 'cost' ? t('expenseAnalysis') : t('incomeAnalysis')}</div>
        <div className="total">¥{totalAmount.toFixed(2)}</div>
        <div className="catalog-button">
          {t('totalItems', { count: recordCount, type: type === 'cost' ? t('expense') : t('income') })}
        </div>
      </ChartHeader>
      
      <ChartContainer ref={chartRef} />
      
      <TagList>
        {tagSummaries.map(tag => (
          <TagItem key={tag.tagId}>
            <div className="color-indicator" style={{ backgroundColor: tag.color }}></div>
            <div className="tag-info">
              <div className="icon">
                <Icon name={`tags/${tag.tagIcon}`} size={20} className='icon-only'/>
              </div>
              <div className="name">{tag.tagName}</div>
            </div>
            <div className="amount-info">
              <div className="amount">¥{tag.amount.toFixed(2)}</div>
              <div className="percentage">{tag.percentage.toFixed(1)}%</div>
            </div>
          </TagItem>
        ))}
      </TagList>
    </Container>
  );
} 