'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { styled } from 'styled-components';
import { createClient } from '@/app/lib/supabase/client';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface SummarySectionProps {
  userId: string;
  locale: string;
}

interface SummaryData {
  recordCount: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topExpenseCategory: string;
  topIncomeCategory: string;
  hasSavings: boolean;
  tips: string[];
  isAiTips: boolean;
}

interface Tag {
  id: string;
  name: string;
  category: 'income' | 'cost';
  icon: string;
}

interface FinancialRecord {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  tag_id: string;
  tags: Tag;
  date: string;
  description?: string;
  created_at: string;
}

const Container = styled.div`
  background: white;
  border-radius: 12px;
  margin: 0 16px 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
`;

const Header = styled.div`
  background: #53a867;
  color: white;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  > .toggle-icon {
    transition: transform 0.2s ease;
  }
`;

const Content = styled.div<{ isCollapsed: boolean }>`
  padding: ${props => props.isCollapsed ? '0' : '16px'};
  max-height: ${props => props.isCollapsed ? '0' : '500px'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const SummaryItem = styled.div`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(83, 168, 103, 0.1);
  }
  
  > .label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
  
  > .value {
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    
    > svg {
      margin-right: 4px;
    }
    
    &.positive {
      color: #53a867;
    }
    
    &.negative {
      color: #e74c3c;
    }
  }
`;

const TipsList = styled.div`
  margin-top: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #53a867;
  overflow-y: auto;
  max-height: 300px;
  
  > .title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #53a867;
    display: flex;
    align-items: center;
    
    > svg {
      margin-right: 6px;
    }
  }
  
  > .tip {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    
    > svg {
      margin-right: 8px;
      margin-top: 2px;
      flex-shrink: 0;
    }
    
    > .text {
      font-size: 14px;
      color: #333;
      line-height: 1.5;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const NotEnoughData = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  text-align: center;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 8px 0;
  
  > svg {
    margin-bottom: 16px;
    color: #53a867;
    background: rgba(83, 168, 103, 0.1);
    padding: 8px;
    border-radius: 50%;
  }
  
  > .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #53a867;
  }
  
  > .message {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    max-width: 280px;
  }
`;

export default function SummarySection({ userId, locale }: SummarySectionProps) {
  const t = useTranslations('statistics');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoadingAiTips, setIsLoadingAiTips] = useState(false);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Get last 90 days of records with tag information
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const { data: records, error } = await supabase
          .from('records')
          .select(`
            *,
            tags:tag_id (
              id,
              category,
              name,
              icon
            )
          `)
          .eq('user_id', userId)
          .gte('updated_at', ninetyDaysAgo.toISOString())
          .order('updated_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching records:', error);
          setIsLoading(false);
          return;
        }
        
        if (!records || records.length < 3) {
          setSummaryData({
            recordCount: records?.length || 0,
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            topExpenseCategory: '',
            topIncomeCategory: '',
            hasSavings: false,
            tips: [t('keepRecordingMessage')],
            isAiTips: false
          });
          setIsLoading(false);
          return;
        }
        
        // Process records with tag information
        const processedRecords = records.map(record => ({
          ...record,
          category: record.tags?.category || 'unknown',
          tagName: record.tags?.name || 'unknown'
        }));
        
        // Calculate summary data
        const incomeRecords = processedRecords.filter(record => record.category === 'income');
        const expenseRecords = processedRecords.filter(record => record.category === 'cost');
        
        const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
        const totalExpense = expenseRecords.reduce((sum, record) => sum + record.amount, 0);
        const balance = totalIncome - totalExpense;
        
        // Find top categories
        const expenseCategories: Record<string, number> = {};
        expenseRecords.forEach(record => {
          expenseCategories[record.name] = (expenseCategories[record.name] || 0) + record.amount;
        });
        
        const incomeCategories: Record<string, number> = {};
        incomeRecords.forEach(record => {
          incomeCategories[record.name] = (incomeCategories[record.name] || 0) + record.amount;
        });
        
        const topExpenseCategory = Object.entries(expenseCategories)
          .sort((a, b) => b[1] - a[1])
          .map(([category]) => category)[0] || '';
          
        const topIncomeCategory = Object.entries(incomeCategories)
          .sort((a, b) => b[1] - a[1])
          .map(([category]) => category)[0] || '';
        
        // Set initial data with placeholder tips
        setSummaryData({
          recordCount: processedRecords.length,
          totalIncome,
          totalExpense,
          balance,
          topExpenseCategory,
          topIncomeCategory,
          hasSavings: balance > 0,
          tips: [t('tips.keepTracking')],
          isAiTips: false
        });
        
        // Fetch AI tips
        fetchAiTips(userId, locale);
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummaryData();
  }, [userId, locale, t]);
  
  const fetchAiTips = async (userId: string, locale: string) => {
    try {
      setIsLoadingAiTips(true);
      
      const response = await fetch(`/${locale}/api/analyze-statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, locale }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI tips');
      }
      
      const data = await response.json();
      
      if (data.tips && data.tips.length > 0) {
        setSummaryData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            tips: data.tips,
            isAiTips: true
          };
        });
      }
    } catch (error) {
      console.error('Error fetching AI tips:', error);
      // Keep the existing tips if AI tips fetch fails
    } finally {
      setIsLoadingAiTips(false);
    }
  };
  
  if (isLoading) {
    return (
      <Container>
        <Header onClick={toggleCollapse}>
          <span>{t('summary')}</span>
          <div title={t('expandSummary')}>
            <ChevronDown size={18} className="toggle-icon" />
          </div>
        </Header>
        <Content isCollapsed={false}>
          <div>{t('loading')}</div>
        </Content>
      </Container>
    );
  }
  
  if (!summaryData || summaryData.recordCount < 3) {
    return (
      <Container>
        <Header onClick={toggleCollapse}>
          <span>{t('summary')}</span>
          <div title={t('expandSummary')}>
            <ChevronDown size={18} className="toggle-icon" />
          </div>
        </Header>
        <Content isCollapsed={false}>
          <NotEnoughData>
            <AlertCircle size={32} />
            <div className="title">{t('notEnoughData')}</div>
            <div className="message">{t('keepRecordingMessage')}</div>
          </NotEnoughData>
        </Content>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header onClick={toggleCollapse}>
        <span>{t('summary')}</span>
        {isCollapsed ? (
          <div title={t('expandSummary')}>
            <ChevronDown size={18} className="toggle-icon" />
          </div>
        ) : (
          <div title={t('collapseSummary')}>
            <ChevronUp size={18} className="toggle-icon" />
          </div>
        )}
      </Header>
      <Content isCollapsed={isCollapsed}>
        <SummaryGrid>
          <SummaryItem>
            <div className="label">{t('totalIncome')}</div>
            <div className="value positive">
              <TrendingUp size={16} />
              ¥{summaryData.totalIncome.toFixed(2)}
            </div>
          </SummaryItem>
          <SummaryItem>
            <div className="label">{t('totalExpense')}</div>
            <div className="value negative">
              <TrendingDown size={16} />
              ¥{summaryData.totalExpense.toFixed(2)}
            </div>
          </SummaryItem>
          <SummaryItem>
            <div className="label">{t('balance')}</div>
            <div className={`value ${summaryData.balance >= 0 ? 'positive' : 'negative'}`}>
              {summaryData.balance >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              ¥{Math.abs(summaryData.balance).toFixed(2)}
            </div>
          </SummaryItem>
          <SummaryItem>
            <div className="label">{t('recordCount')}</div>
            <div className="value">
              {summaryData.recordCount}
            </div>
          </SummaryItem>
        </SummaryGrid>
        
        <TipsList>
          <div className="title">
            {summaryData.isAiTips && <Sparkles size={16} color="#53a867" />}
            {t('financialTips')}
          </div>
          {isLoadingAiTips ? (
            <div className="tip">
              <div className="text">{t('aiAnalysisLoading')}</div>
            </div>
          ) : (
            summaryData.tips.map((tip, index) => (
              <div key={index} className="tip">
                <CheckCircle size={16} color="#53a867" />
                <div className="text">{tip}</div>
              </div>
            ))
          )}
        </TipsList>
      </Content>
    </Container>
  );
} 