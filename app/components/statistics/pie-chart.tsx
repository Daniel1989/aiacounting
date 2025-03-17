'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/app/lib/supabase/client';
import dayjs from 'dayjs';
import { styled } from 'styled-components';
import { Icon } from '@/app/components/ui/icon';

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
    color: #a0cac6;
    margin-bottom: 8px;
  }
  
  > .total {
    font-size: 28px;
    font-weight: bold;
    color: #a0cac6;
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
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0;
`;

const TotalAmount = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  > .amount {
    font-size: 24px;
    font-weight: bold;
    color: #a0cac6;
  }
  
  > .label {
    font-size: 12px;
    color: #999;
  }
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
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchTagSummaries() {
      setIsLoading(true);
      
      try {
        const startOfMonth = dayjs(date).startOf('month').toISOString();
        const endOfMonth = dayjs(date).endOf('month').toISOString();
        
        // Fetch records with tag information
        const { data: recordsData, error: recordsError } = await supabase
          .from('records')
          .select(`
            amount,
            is_user_tag,
            tag_id,
            tags (id, name, icon)
          `)
          .eq('user_id', userId)
          .eq('category', type)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);
        
        if (recordsError) throw recordsError;
        
        // Process records to get tag summaries
        const tagMap = new Map<number, { tagId: number; tagName: string; tagIcon: string; amount: number }>();
        
        if (recordsData) {
          recordsData.forEach((record: any) => {
            if (!record.tags) return;
            
            const tagId = record.tag_id;
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
                tagIcon: record.tags.icon,
                amount
              });
            }
          });
        }
        
        // Calculate total amount
        const total = Array.from(tagMap.values()).reduce((sum, item) => sum + item.amount, 0);
        setTotalAmount(total);
        
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
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTagSummaries();
  }, [userId, date, type, supabase]);
  
  if (isLoading) {
    return <NoData>{t('loading')}</NoData>;
  }
  
  if (tagSummaries.length === 0) {
    return <NoData>{t('noData')}</NoData>;
  }
  
  // Calculate the position for each label
  const calculateLabelPosition = (startAngle: number, endAngle: number) => {
    // Use the middle angle for the label
    const midAngle = (startAngle + endAngle) / 2;
    
    // Position the label outside the donut
    const labelRadius = 60; // Slightly larger than the outer radius of the donut
    const x = 50 + labelRadius * Math.cos(midAngle);
    const y = 50 + labelRadius * Math.sin(midAngle);
    
    // Calculate the anchor point for the line
    const innerRadius = 35; // Inner radius of the donut
    const outerRadius = 50; // Outer radius of the donut
    const midRadius = (innerRadius + outerRadius) / 2;
    const lineStartX = 50 + midRadius * Math.cos(midAngle);
    const lineStartY = 50 + midRadius * Math.sin(midAngle);
    
    return { x, y, lineStartX, lineStartY, midAngle };
  };
  
  return (
    <Container>
      <ChartHeader>
        <div className="title">{type === 'cost' ? t('expenseAnalysis') : t('incomeAnalysis')}</div>
        <div className="total">¥ {totalAmount.toFixed(2)}</div>
        <div className="catalog-button">
          {t('totalItems', { 
            count: tagSummaries.length,
            type: type === 'cost' ? t('expense') : t('income')
          })}
        </div>
      </ChartHeader>
      
      <ChartContainer>
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ maxHeight: '300px' }}>
          {/* Donut chart segments */}
          {tagSummaries.map((tag, index) => {
            // Calculate angles for the donut segment
            const startAngle = index > 0 
              ? tagSummaries.slice(0, index).reduce((sum, t) => sum + t.percentage, 0) * 3.6 * Math.PI / 180
              : 0;
            const endAngle = startAngle + tag.percentage * 3.6 * Math.PI / 180;
            
            // Calculate points for the donut segment
            const innerRadius = 25; // Inner radius for the donut hole
            const outerRadius = 40; // Outer radius for the donut
            
            const startOuterX = 50 + outerRadius * Math.cos(startAngle);
            const startOuterY = 50 + outerRadius * Math.sin(startAngle);
            const endOuterX = 50 + outerRadius * Math.cos(endAngle);
            const endOuterY = 50 + outerRadius * Math.sin(endAngle);
            
            const startInnerX = 50 + innerRadius * Math.cos(endAngle);
            const startInnerY = 50 + innerRadius * Math.sin(endAngle);
            const endInnerX = 50 + innerRadius * Math.cos(startAngle);
            const endInnerY = 50 + innerRadius * Math.sin(startAngle);
            
            const largeArcFlag = tag.percentage > 50 ? 1 : 0;
            
            // Path for the donut segment
            const path = [
              `M ${startOuterX} ${startOuterY}`,
              `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`,
              `L ${startInnerX} ${startInnerY}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}`,
              'Z'
            ].join(' ');
            
            // Calculate label position
            const { x, y, lineStartX, lineStartY, midAngle } = calculateLabelPosition(startAngle, endAngle);
            
            // Determine text anchor based on position
            const isRightSide = x > 50;
            const textAnchor = isRightSide ? 'start' : 'end';
            
            // Only show labels for segments with significant percentage
            const showLabel = tag.percentage > 5;
            
            return (
              <g key={tag.tagId}>
                <path d={path} fill={tag.color} />
                
                {showLabel && (
                  <>
                    {/* Line from segment to label */}
                    <line
                      x1={lineStartX}
                      y1={lineStartY}
                      x2={x}
                      y2={y}
                      stroke={tag.color}
                      strokeWidth="0.5"
                    />
                    
                    {/* Label text */}
                    <text
                      x={isRightSide ? x + 1 : x - 1}
                      y={y}
                      fontSize="3"
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      fill="#333"
                    >
                      {tag.tagName}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </ChartContainer>
      
      <TagList>
        {tagSummaries.map(tag => (
          <TagItem key={tag.tagId}>
            <div className="color-indicator" style={{ backgroundColor: tag.color }}></div>
            <div className="tag-info">
              <div className="icon">
                <Icon name={`tags/${tag.tagIcon}`} size={20} />
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