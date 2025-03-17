'use client';

import { useState } from 'react';
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

export default function GoalSettingForm({ userId, locale, type }: GoalSettingFormProps) {
  const t = useTranslations('wishlist');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    targetAmount: '',
    monthlyIncome: '',
    description: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const supabase = createClient();
      
      // Create a new goal
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          type,
          target_amount: type === 'savings' ? parseFloat(formData.targetAmount) : null,
          monthly_income: parseFloat(formData.monthlyIncome),
          description: formData.description,
          status: 'active'
        });
      
      if (error) throw error;
      
      toast.success(t('goalCreated'));
      router.push(`/${locale}/wishlist`);
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error(t('errorCreatingGoal'));
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
        <div className="title">{t('setGoal')}</div>
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
          {t('startAnalysis')}
        </SubmitButton>
      </Form>
    </Container>
  );
} 