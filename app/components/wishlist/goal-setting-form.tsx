'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { styled } from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface GoalSettingFormProps {
  userId: string;
  locale: string;
  type: string;
  existingGoal?: any;
}

interface AnalysisResult {
  timeToGoal: number;
  dailySavings: number;
  suggestions: string[];
  actionableSteps: string[];
  challenges: { challenge: string; solution: string; }[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  
  > .back-button {
    background: none;
    border: none;
    padding: 8px;
    margin-right: 8px;
    cursor: pointer;
    color: #333;
  }
  
  > .title {
    font-size: 18px;
    font-weight: bold;
  }
`;

const Form = styled.form`
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  > .label {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }
  
  > .input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    
    &::placeholder {
      color: #999;
    }
    
    &:focus {
      outline: none;
      border-color: #53a867;
    }
  }
  
  > textarea.input {
    min-height: 120px;
    resize: vertical;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: auto;
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  
  > .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #000;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 24px;
  }
  
  > .text {
    font-size: 18px;
    color: #333;
    margin-bottom: 8px;
  }
  
  > .subtext {
    font-size: 14px;
    color: #666;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AnalysisResult = styled.div`
  padding: 24px 16px;
  
  > .section {
    margin-bottom: 32px;
    
    > .title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    
    > .content {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      
      &.metrics {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        
        > .metric {
          text-align: center;
          
          > .value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          > .label {
            font-size: 14px;
            color: #666;
          }
        }
      }
      
      &.list {
        > .item {
          margin-bottom: 12px;
          padding-left: 20px;
          position: relative;
          
          &:before {
            content: "•";
            position: absolute;
            left: 0;
          }
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
      
      &.challenges {
        > .challenge {
          margin-bottom: 16px;
          
          > .problem {
            font-weight: 500;
            margin-bottom: 8px;
          }
          
          > .solution {
            color: #666;
            padding-left: 16px;
          }
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px;
  
  > button {
    padding: 16px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    
    &.primary {
      background: #000;
      color: white;
      border: none;
    }
    
    &.secondary {
      background: white;
      color: #000;
      border: 1px solid #000;
    }
  }
`;

export default function GoalSettingForm({ userId, locale, type, existingGoal }: GoalSettingFormProps) {
  const t = useTranslations('wishlist');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [formData, setFormData] = useState({
    targetAmount: '',
    monthlyIncome: '',
    description: ''
  });
  
  // Initialize form with existing goal data if available
  useEffect(() => {
    if (existingGoal) {
      setFormData({
        targetAmount: existingGoal.target_amount ? String(existingGoal.target_amount) : '',
        monthlyIncome: String(existingGoal.monthly_income),
        description: existingGoal.description
      });
      
      // If the goal has analysis data, set it
      if (existingGoal.time_to_goal && existingGoal.daily_savings) {
        setAnalysis({
          timeToGoal: existingGoal.time_to_goal,
          dailySavings: existingGoal.daily_savings,
          suggestions: [],
          actionableSteps: [],
          challenges: []
        });
      }
    }
  }, [existingGoal]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setIsAnalyzing(true);
      
      // Start AI analysis
      const response = await fetch(`/${locale}/api/analyze-goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          targetAmount: type === 'savings' ? parseFloat(formData.targetAmount) : null,
          monthlyIncome: parseFloat(formData.monthlyIncome),
          description: formData.description,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const analysisResult = await response.json();
      setAnalysis(analysisResult);
      setIsAnalyzing(false);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('errorAnalyzing'));
      setIsAnalyzing(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const isValid = () => {
    if (type === 'savings') {
      return (
        formData.targetAmount.trim() !== '' &&
        formData.monthlyIncome.trim() !== '' &&
        formData.description.trim() !== ''
      );
    }
    return formData.monthlyIncome.trim() !== '' && formData.description.trim() !== '';
  };

  const handleConfirm = async () => {
    try {
      const supabase = createClient();
      
      const goalData = {
        user_id: userId,
        type,
        target_amount: type === 'savings' ? parseFloat(formData.targetAmount) : null,
        monthly_income: parseFloat(formData.monthlyIncome),
        description: formData.description,
        time_to_goal: analysis?.timeToGoal,
        daily_savings: analysis?.dailySavings,
        status: 'active'
      };
      
      if (existingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', existingGoal.id);
        
        if (error) throw error;
        
        toast.success(t('goalUpdated'));
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          .insert(goalData);
        
        if (error) throw error;
        
        toast.success(t('goalCreated'));
      }
      
      router.push(`/${locale}/wishlist`);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error(existingGoal ? t('errorUpdatingGoal') : t('errorCreatingGoal'));
    }
  };
  
  if (isAnalyzing) {
    return (
      <Container>
        <LoadingContainer>
          <div className="spinner" />
          <div className="text">{t('analyzing')}</div>
          <div className="subtext">{t('analyzingDescription')}</div>
        </LoadingContainer>
      </Container>
    );
  }
  
  if (analysis) {
    return (
      <Container>
        <Header>
          <div className="title">{existingGoal ? t('updatePlan') : t('analysisResult')}</div>
        </Header>
        
        <AnalysisResult>
          <div className="section">
            <div className="title">{t('overview')}</div>
            <div className="content metrics">
              <div className="metric">
                <div className="value">{analysis.timeToGoal} {t('days')}</div>
                <div className="label">{t('estimatedTime')}</div>
              </div>
              <div className="metric">
                <div className="value">¥{analysis.dailySavings.toFixed(2)}</div>
                <div className="label">{t('dailySavings')}</div>
              </div>
            </div>
          </div>
          
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="section">
              <div className="title">{t('suggestions')}</div>
              <div className="content list">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="item">{suggestion}</div>
                ))}
              </div>
            </div>
          )}
          
          {analysis.actionableSteps && analysis.actionableSteps.length > 0 && (
            <div className="section">
              <div className="title">{t('actionableSteps')}</div>
              <div className="content list">
                {analysis.actionableSteps.map((step, index) => (
                  <div key={index} className="item">{step}</div>
                ))}
              </div>
            </div>
          )}
          
          {analysis.challenges && analysis.challenges.length > 0 && (
            <div className="section">
              <div className="title">{t('challenges')}</div>
              <div className="content challenges">
                {analysis.challenges.map((item, index) => (
                  <div key={index} className="challenge">
                    <div className="problem">{item.challenge}</div>
                    <div className="solution">{item.solution}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnalysisResult>
        
        <ActionButtons>
          <button className="secondary" onClick={() => setAnalysis(null)}>
            {t('reanalyze')}
          </button>
          <button className="primary" onClick={handleConfirm}>
            {existingGoal ? t('updatePlan') : t('confirmPlan')}
          </button>
        </ActionButtons>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <button 
          className="back-button"
          onClick={() => router.push(`/${locale}/wishlist`)}
          type="button"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="title">{existingGoal ? t('editGoal') : t('setGoal')}</div>
      </Header>
      
      <Form onSubmit={handleSubmit}>
        {type === 'savings' && (
          <FormGroup>
            <div className="label">{t('targetAmount')}</div>
            <input
              type="number"
              name="targetAmount"
              className="input"
              placeholder={t('enterTargetAmount')}
              value={formData.targetAmount}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </FormGroup>
        )}
        
        <FormGroup>
          <div className="label">{t('monthlyIncome')}</div>
          <input
            type="number"
            name="monthlyIncome"
            className="input"
            placeholder={t('enterMonthlyIncome')}
            value={formData.monthlyIncome}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </FormGroup>
        
        <FormGroup>
          <div className="label">{t('goalDescription')}</div>
          <textarea
            name="description"
            className="input"
            placeholder={t('enterGoalDescription')}
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup>
        
        <SubmitButton 
          type="submit" 
          disabled={!isValid() || isSubmitting}
        >
          {existingGoal ? t('updateAnalysis') : t('startAnalysis')}
        </SubmitButton>
      </Form>
    </Container>
  );
} 