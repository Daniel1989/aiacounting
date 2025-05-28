'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { styled } from 'styled-components';
import { Plane, ShoppingBag, PiggyBank, Circle, CheckCircle2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';

interface WishlistContentProps {
  userId: string;
  locale: string;
  hasActivatedInviteCode: boolean;
}

interface Goal {
  id: string;
  type: string;
  target_amount: number | null;
  monthly_income: number;
  description: string;
  time_to_goal: number;
  daily_savings: number;
  daily_max_expense: number;
  status: string;
  created_at: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  background: #f5f5f5;
  padding: 16px;
`;

const Header = styled.div`
  text-align: left;
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

// New styled component for locked features
const LockedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  
  > .lock-icon {
    margin-bottom: 8px;
  }
  
  > .lock-text {
    font-size: 14px;
    text-align: center;
    padding: 0 12px;
  }
`;

const GoalCardWrapper = styled.div`
  position: relative;
`;

export default function WishlistContent({ userId, locale, hasActivatedInviteCode }: WishlistContentProps) {
  const t = useTranslations('wishlist');
  const router = useRouter();
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actualSpending, setActualSpending] = useState<number>(0);
  const [todaySpending, setTodaySpending] = useState<number>(0);

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

          // If we have an active goal, fetch the spending since it was created
          if (data.created_at) {
            // Get total spending since goal creation
            const { data: spendingData, error: spendingError } = await supabase
              .from('records')
              .select('amount')
              .eq('user_id', userId)
              .eq('category', 'cost')
              .gte('created_at', data.created_at)
              .order('created_at', { ascending: false });

            if (spendingError) {
              console.error('Error fetching spending:', spendingError);
            } else if (spendingData) {
              // Calculate total spending
              const totalSpending = spendingData.reduce((sum, record) => sum + record.amount, 0);
              setActualSpending(totalSpending);
            }

            // Get today's spending
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: todayData, error: todayError } = await supabase
              .from('records')
              .select('amount')
              .eq('user_id', userId)
              .eq('category', 'cost')
              .gte('created_at', today.toISOString())
              .order('created_at', { ascending: false });

            if (todayError) {
              console.error('Error fetching today spending:', todayError);
            } else if (todayData) {
              // Calculate today's spending
              const todayTotal = todayData.reduce((sum, record) => sum + record.amount, 0);
              setTodaySpending(todayTotal);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveGoal();
  }, [userId]);

  const handleSelectGoal = (type: string) => {
    // For shopping and savings, check if user has activated an invite code
    // if ((type === 'shopping' || type === 'savings') && !hasActivatedInviteCode) {
    //   // Don't navigate if premium feature is locked
    //   return;
    // }

    // If user has an active goal, show it instead of creating a new one
    if (activeGoal) {
      router.push(`/${locale}/wishlist`);
    } else {
      router.push(`/${locale}/wishlist/${type}`);
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

  // Calculate progress percentage based on daily max expense and days passed
  const calculateProgress = () => {
    if (!activeGoal || !activeGoal.target_amount || !activeGoal.daily_max_expense) return 0;

    // Calculate days passed since the goal was created
    const startDate = new Date(activeGoal.created_at);
    const currentDate = new Date();
    const daysPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate theoretical saved amount: daily max expense * days passed
    const theoreticalSaved = activeGoal.daily_max_expense * daysPassed;

    // Calculate actual saved: theoretical saved - actual spending
    const actualSaved = theoreticalSaved - actualSpending;

    // Calculate progress as percentage of target amount
    const progressPercentage = (actualSaved / activeGoal.target_amount) * 100;

    // Ensure progress doesn't exceed 100%
    return Math.min(Math.max(progressPercentage, 0), 100);
  };

  // Calculate daily metrics for display
  const calculateDailyMetrics = () => {
    if (!activeGoal) return { recommendedExpense: 0, todayExpense: 0, savings: 0 };

    // Use the daily max expense as the recommended expense
    const recommendedExpense = activeGoal.daily_max_expense;

    // Use actual today's spending from the database
    const todayExpense = todaySpending;

    // Calculate savings (positive if under budget, negative if over)
    const savings = recommendedExpense - todayExpense;

    return { recommendedExpense, todayExpense, savings };
  };

  // Calculate estimated completion date
  const calculateCompletionDate = () => {
    if (!activeGoal || !activeGoal.target_amount || !activeGoal.daily_savings) {
      return null;
    }

    // Calculate days since goal creation
    const startDate = new Date(activeGoal.created_at);
    const currentDate = new Date();
    const daysPassed = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate progress as amount saved
    const progress = calculateProgress();
    const savedAmount = (activeGoal.target_amount * progress) / 100;

    // Calculate remaining amount
    const remainingAmount = activeGoal.target_amount - savedAmount;

    // Calculate days needed to save remaining amount
    const daysRemaining = Math.ceil(remainingAmount / activeGoal.daily_savings);

    // Calculate estimated completion date
    const completionDate = new Date(currentDate);
    completionDate.setDate(completionDate.getDate() + daysRemaining);

    return completionDate;
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </Container>
    );
  }

  if (activeGoal) {
    const progress = calculateProgress();
    const targetAmount = activeGoal.target_amount || 0;
    const progressAmount = (targetAmount * progress) / 100;
    const { recommendedExpense, todayExpense, savings } = calculateDailyMetrics();
    const completionDate = calculateCompletionDate();

    return (
      <Container>
        {/* <Header>
          <div className="title">{t('planStatus')}</div>
        </Header> */}

        <PlanStatusContainer>
          <PlanHeader>{t('planProgress')}</PlanHeader>

          <PlanSection>
            <div className="title">{t('targetProgress')}</div>
            <div className="amount">¥{targetAmount.toLocaleString()}</div>
            <div className="progress-text">{t('completed')} {progress.toFixed(1)}%</div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            {completionDate && (
              <div className="progress-text" style={{ marginTop: '8px' }}>
                {t('estimatedCompletion')}: {completionDate.toLocaleDateString()}
              </div>
            )}
          </PlanSection>

          <PlanSection>
            <div className="title">{t('monthStatus')}</div>
            <div className="status-item">
              <CheckCircle2 size={16} className="icon" />
              <div className="text">
                {savings >= 0
                  ? `${t('aheadOfPlan')} ${Math.floor(savings / activeGoal.daily_savings)} ${t('days')}`
                  : `${t('behindPlan')} ${Math.ceil(Math.abs(savings) / activeGoal.daily_savings)} ${t('days')}`}
              </div>
            </div>
          </PlanSection>

          <PlanSection>
            <div className="title">{t('dailyRecords')}</div>
            <div className="record">
              <div className="label">{t('todayExpense')}</div>
              <div className="value">¥{todayExpense.toLocaleString()}</div>
            </div>
            <div className="record">
              <div className="label">{t('recommendedExpense')}</div>
              <div className="value">¥{recommendedExpense.toLocaleString()}</div>
            </div>
            <div className="record">
              <div className="label">{t('savings')}</div>
              <div className={`value ${savings >= 0 ? 'saving' : ''}`}>
                ¥{savings.toLocaleString()}
              </div>
            </div>
          </PlanSection>
        </PlanStatusContainer>

        <ActionButtons>
          <button className="secondary" onClick={() => router.push(`/${locale}/wishlist/${activeGoal.type}?edit=${activeGoal.id}`)}>
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
        {/* <GoalCardWrapper>
          <GoalCard onClick={() => handleSelectGoal('savings')}>
            <div className="icon-container savings">
              <PiggyBank size={24} />
            </div>
            <div className="content">
              <div className="title">{t('saving.title')}</div>
              <div className="description">{t('saving.description')}</div>
            </div>
          </GoalCard>
        </GoalCardWrapper> */}
        <GoalCardWrapper>
          <GoalCard onClick={() => handleSelectGoal('travel')}>
            <div className="icon-container travel">
              <Plane size={24} />
            </div>
            <div className="content">
              <div className="title">{t('travel.title')}</div>
              <div className="description">{t('travel.description')}</div>
            </div>
          </GoalCard>
        </GoalCardWrapper>

        <GoalCardWrapper>
          <GoalCard onClick={() => handleSelectGoal('shopping')}>
            <div className="icon-container shopping">
              <ShoppingBag size={24} />
            </div>
            <div className="content">
              <div className="title">{t('shopping.title')}</div>
              <div className="description">{t('shopping.description')}</div>
            </div>
          </GoalCard>
          {/* {!hasActivatedInviteCode && (
            <LockedOverlay>
              <Lock className="lock-icon" size={24} />
              <div className="lock-text">{t('premiumFeature')}</div>
            </LockedOverlay>
          )} */}
        </GoalCardWrapper>

        <GoalCardWrapper>
          <GoalCard onClick={() => handleSelectGoal('savings')}>
            <div className="icon-container savings">
              <PiggyBank size={24} />
            </div>
            <div className="content">
              <div className="title">{t('saving.title')}</div>
              <div className="description">{t('saving.description')}</div>
            </div>
          </GoalCard>
          {/* {!hasActivatedInviteCode && (
            <LockedOverlay>
              <Lock className="lock-icon" size={24} />
              <div className="lock-text">{t('premiumFeature')}</div>
            </LockedOverlay>
          )} */}
        </GoalCardWrapper>
      </GoalList>
    </Container>
  );
} 