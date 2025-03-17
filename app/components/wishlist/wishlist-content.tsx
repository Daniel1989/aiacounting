'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { styled } from 'styled-components';
import { Plane, ShoppingBag, PiggyBank, Circle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';

interface WishlistContentProps {
  userId: string;
  locale: string;
}

interface Goal {
  id: string;
  type: string;
  target_amount: number | null;
  monthly_income: number;
  description: string;
  time_to_goal: number;
  daily_savings: number;
  status: string;
  created_at: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  padding: 16px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
  
  > .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  > .subtitle {
    font-size: 14px;
    color: #666;
  }
`;

const GoalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GoalCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  > .icon-container {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.travel {
      background: #53a867;
      color: white;
    }
    
    &.shopping {
      background: #6bbf7b;
      color: white;
    }
    
    &.savings {
      background: #478c58;
      color: white;
    }
  }
  
  > .content {
    flex: 1;
    
    > .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    > .description {
      font-size: 14px;
      color: #666;
    }
  }
`;

const PlanStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
`;

const PlanHeader = styled.div`
  background: #53a867;
  color: white;
  padding: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
`;

const PlanSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  > .title {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  
  > .progress-container {
    margin-top: 8px;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    
    > .progress-bar {
      height: 100%;
      background: #53a867;
      border-radius: 4px;
    }
  }
  
  > .amount {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  > .progress-text {
    font-size: 14px;
    color: #666;
  }
  
  > .status-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    > .icon {
      margin-right: 8px;
      color: #53a867;
    }
    
    > .text {
      font-size: 14px;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  > .record {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    > .label {
      font-size: 14px;
    }
    
    > .value {
      font-size: 14px;
      font-weight: bold;
      
      &.saving {
        color: #53a867;
      }
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
  
  > button {
    padding: 16px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    
    &.primary {
      background: #53a867;
      color: white;
      border: none;
      
      &:hover {
        background: #478c58;
      }
    }
    
    &.secondary {
      background: white;
      color: #53a867;
      border: 2px solid #53a867;
      
      &:hover {
        background: #f0f9f2;
      }
    }
  }
`;

export default function WishlistContent({ userId, locale }: WishlistContentProps) {
  const t = useTranslations('wishlist');
  const router = useRouter();
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchActiveGoal = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            console.error('Error fetching active goal:', error);
          }
        } else if (data) {
          setActiveGoal(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActiveGoal();
  }, [userId]);
  
  const goals = [
    {
      id: 'travel',
      icon: <Plane size={24} />,
      title: t('travel.title'),
      description: t('travel.description'),
    },
    {
      id: 'shopping',
      icon: <ShoppingBag size={24} />,
      title: t('shopping.title'),
      description: t('shopping.description'),
    },
    {
      id: 'savings',
      icon: <PiggyBank size={24} />,
      title: t('saving.title'),
      description: t('saving.description'),
    },
  ];
  
  const handleAdjustPlan = () => {
    if (activeGoal) {
      router.push(`/${locale}/wishlist/${activeGoal.type}?edit=${activeGoal.id}`);
    }
  };
  
  const handleAbandonPlan = async () => {
    if (!activeGoal) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('goals')
        .update({ status: 'cancelled' })
        .eq('id', activeGoal.id);
      
      if (error) throw error;
      
      setActiveGoal(null);
    } catch (error) {
      console.error('Error abandoning plan:', error);
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!activeGoal || !activeGoal.target_amount) return 0;
    
    // For demo purposes, let's assume 35% progress
    return 35;
  };
  
  if (isLoading) {
    return (
      <Container>
        <div>Loading...</div>
      </Container>
    );
  }
  
  if (activeGoal) {
    const progress = calculateProgress();
    const targetAmount = activeGoal.target_amount || 0;
    const progressAmount = (targetAmount * progress) / 100;
    
    return (
      <Container>
        <Header>
          <div className="title">{t('planStatus')}</div>
        </Header>
        
        <PlanStatusContainer>
          <PlanHeader>{t('planProgress')}</PlanHeader>
          
          <PlanSection>
            <div className="title">{t('targetProgress')}</div>
            <div className="amount">¥ {targetAmount.toLocaleString()}</div>
            <div className="progress-text">{t('completed')} {progress}%</div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </PlanSection>
          
          <PlanSection>
            <div className="title">{t('monthStatus')}</div>
            <div className="status-item">
              <CheckCircle2 size={16} className="icon" />
              <div className="text">{t('aheadOfPlan')} 2 {t('days')}</div>
            </div>
          </PlanSection>
          
          <PlanSection>
            <div className="title">{t('dailyRecords')}</div>
            <div className="record">
              <div className="label">{t('todayExpense')}</div>
              <div className="value">¥ 120</div>
            </div>
            <div className="record">
              <div className="label">{t('recommendedExpense')}</div>
              <div className="value">¥ 150</div>
            </div>
            <div className="record">
              <div className="label">{t('savings')}</div>
              <div className="value saving">¥ 30</div>
            </div>
          </PlanSection>
        </PlanStatusContainer>
        
        <ActionButtons>
          <button className="secondary" onClick={handleAdjustPlan}>
            {t('adjustPlan')}
          </button>
          <button className="primary" onClick={handleAbandonPlan}>
            {t('abandonPlan')}
          </button>
        </ActionButtons>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <div className="title">{t('title')}</div>
        <div className="subtitle">{t('subtitle')}</div>
      </Header>
      
      <GoalList>
        {goals.map((goal) => (
          <GoalCard 
            key={goal.id}
            onClick={() => router.push(`/${locale}/wishlist/${goal.id}`)}
          >
            <div className={`icon-container ${goal.id}`}>
              {goal.icon}
            </div>
            <div className="content">
              <div className="title">{goal.title}</div>
              <div className="description">{goal.description}</div>
            </div>
          </GoalCard>
        ))}
      </GoalList>
    </Container>
  );
} 