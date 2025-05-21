'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { styled } from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'


interface GoalSettingFormProps {
  userId: string;
  locale: string;
  type: string;
  existingGoal?: any;
}

interface AnalysisResult {
  dailySavings: number;
  suggestions: string[];
  actionableSteps: string[];
  challenges: { challenge: string; solution: string; }[];
  dailyMaxExpense: number;
  totalCost: number;
  rawLlmOutput?: string;
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
  background: #53a867;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: auto;
  
  &:hover {
    background: #478c58;
  }
  
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
    border-top: 4px solid #53a867;
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
  
  > .streaming-container {
    margin-top: 32px;
    width: 100%;
    max-width: 700px;
    text-align: left;
    
    > .stream-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      > .streaming-indicator {
        color: #53a867;
        font-size: 14px;
        font-weight: normal;
        display: flex;
        align-items: center;
        
        > .dot {
          width: 6px;
          height: 6px;
          background: #53a867;
          border-radius: 50%;
          margin-right: 6px;
          animation: pulse 1.5s infinite;
        }
      }
    }
    
    > .stream-content {
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      overflow-x: auto;
      word-break: break-word;
      max-height: 500px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      line-height: 1.6;
      
      /* Markdown specific styles */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 20px;
        margin-bottom: 12px;
        font-weight: 600;
        color: #333;
        border-bottom: none;
      }
      
      h1 { 
        font-size: 1.6em; 
        border-bottom: 1px solid #eaecef;
        padding-bottom: 6px;
      }
      h2 { 
        font-size: 1.4em; 
        border-bottom: 1px solid #eaecef;
        padding-bottom: 4px;
      }
      h3 { font-size: 1.2em; }
      h4 { font-size: 1.1em; }
      
      ul, ol {
        padding-left: 24px;
        margin: 10px 0;
      }
      
      li {
        margin: 5px 0;
      }
      
      p {
        margin: 10px 0;
      }
      
      code {
        background: #f0f0f0;
        padding: 3px 5px;
        border-radius: 4px;
        font-family: 'SFMono-Regular', Consolas, Liberation Mono, Menlo, monospace;
        font-size: 0.9em;
      }
      
      pre {
        background: #f5f5f5;
        color: #333;
        padding: 16px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 16px 0;
        border: 1px solid #e0e0e0;
        
        code {
          background: transparent;
          color: inherit;
          padding: 0;
          white-space: pre;
        }
      }
      
      blockquote {
        border-left: 4px solid #53a867;
        padding: 0 16px;
        margin: 16px 0;
        color: #666;
        background: #f8f8f8;
        font-style: italic;
      }
      
      .table-container {
        overflow-x: auto;
        margin: 16px 0;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 0;
        
        th, td {
          border: 1px solid #e0e0e0;
          padding: 10px 16px;
          text-align: left;
        }
        
        th {
          background: #f5f5f5;
          font-weight: 600;
        }
        
        tr:nth-child(even) {
          background: #f8f8f8;
        }
      }
      
      a {
        color: #53a867;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
          color: #478c58;
        }
      }
      
      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 16px 0;
        display: block;
      }

      strong, b {
        font-weight: 600;
        color: #333;
      }

      em, i {
        font-style: italic;
      }

      /* GitHub Flavored Markdown specific styles */
      del, s {
        text-decoration: line-through;
        color: #666;
      }
      
      input[type="checkbox"] {
        margin-right: 6px;
        vertical-align: middle;
      }
      
      /* Task list styling */
      li.task-list-item {
        list-style-type: none;
        padding-left: 0;
        margin-left: -20px;
      }
      
      ul.contains-task-list {
        padding-left: 30px;
      }

      /* Cursor animation with better positioning */
      &.is-streaming::after {
        content: "";
        position: relative;
        display: inline-block;
        width: 6px;
        height: 16px;
        background-color: #53a867;
        animation: blink 1s infinite;
        vertical-align: text-bottom;
        margin-left: 2px;
      }
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1); }
    100% { opacity: 0.6; transform: scale(0.8); }
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
      color: #333;
    }
    
    > .content {
      background: #ffffff;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      font-size: 14px;
      
      &.metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        
        > .metric {
          text-align: center;
          
          > .value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #53a867;
            word-break: break-word;
          }
          
          > .label {
            font-size: 14px;
            color: #666;
          }
        }
      }
      
      &.raw-response {
        max-height: 500px;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.6;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 6px;
        word-break: break-word;

        background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      overflow-x: auto;
      word-break: break-word;
      max-height: 500px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      position: relative;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      line-height: 1.6;
      
      /* Markdown specific styles */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 20px;
        margin-bottom: 12px;
        font-weight: 600;
        color: #333;
        border-bottom: none;
      }
      
      h1 { 
        font-size: 1.6em; 
        border-bottom: 1px solid #eaecef;
        padding-bottom: 6px;
      }
      h2 { 
        font-size: 1.4em; 
        border-bottom: 1px solid #eaecef;
        padding-bottom: 4px;
      }
      h3 { font-size: 1.2em; }
      h4 { font-size: 1.1em; }
      
      ul, ol {
        padding-left: 24px;
        margin: 10px 0;
      }
      
      li {
        margin: 5px 0;
      }
      
      p {
        margin: 10px 0;
      }
      
      code {
        background: #f0f0f0;
        padding: 3px 5px;
        border-radius: 4px;
        font-family: 'SFMono-Regular', Consolas, Liberation Mono, Menlo, monospace;
        font-size: 0.9em;
      }
      
      pre {
        background: #f5f5f5;
        color: #333;
        padding: 16px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 16px 0;
        border: 1px solid #e0e0e0;
        
        code {
          background: transparent;
          color: inherit;
          padding: 0;
          white-space: pre;
        }
      }
      
      blockquote {
        border-left: 4px solid #53a867;
        padding: 0 16px;
        margin: 16px 0;
        color: #666;
        background: #f8f8f8;
        font-style: italic;
      }
      
      .table-container {
        overflow-x: auto;
        margin: 16px 0;
        border-radius: 4px;
        border: 1px solid #e0e0e0;
      }
      
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 0;
        
        th, td {
          border: 1px solid #e0e0e0;
          padding: 10px 16px;
          text-align: left;
        }
        
        th {
          background: #f5f5f5;
          font-weight: 600;
        }
        
        tr:nth-child(even) {
          background: #f8f8f8;
        }
      }
      
      a {
        color: #53a867;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
          color: #478c58;
        }
      }
      
      img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 16px 0;
        display: block;
      }

      strong, b {
        font-weight: 600;
        color: #333;
      }

      em, i {
        font-style: italic;
      }

      /* GitHub Flavored Markdown specific styles */
      del, s {
        text-decoration: line-through;
        color: #666;
      }
      
      input[type="checkbox"] {
        margin-right: 6px;
        vertical-align: middle;
      }
      
      /* Task list styling */
      li.task-list-item {
        list-style-type: none;
        padding-left: 0;
        margin-left: -20px;
      }
      
      ul.contains-task-list {
        padding-left: 30px;
      }

      /* Cursor animation with better positioning */
      &.is-streaming::after {
        content: "";
        position: relative;
        display: inline-block;
        width: 6px;
        height: 16px;
        background-color: #53a867;
        animation: blink 1s infinite;
        vertical-align: text-bottom;
        margin-left: 2px;
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
            color: #53a867;
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
            color: #333;
          }
          
          > .solution {
            color: #666;
            padding-left: 16px;
            position: relative;
            
            &:before {
              content: "→";
              position: absolute;
              left: 0;
              color: #53a867;
            }
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

export default function GoalSettingForm({ userId, locale, type, existingGoal }: GoalSettingFormProps) {
  const t = useTranslations('wishlist');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessingFinal, setIsProcessingFinal] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [formData, setFormData] = useState({
    targetAmount: '',
    monthlyIncome: '',
    description: ''
  });
  const [streamedResponse, setStreamedResponse] = useState<string>('');
  const [streamComplete, setStreamComplete] = useState(false);
  const streamContentRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom of the stream content as new content comes in
  useEffect(() => {
    if (streamContentRef.current && !streamComplete) {
      streamContentRef.current.scrollTop = streamContentRef.current.scrollHeight;
    }
  }, [streamedResponse, streamComplete]);

  // Initialize form with existing goal data if available
  useEffect(() => {
    if (existingGoal) {
      setFormData({
        targetAmount: existingGoal.totalCost ? String(existingGoal.totalCost) : '',
        monthlyIncome: String(existingGoal.monthly_income),
        description: existingGoal.description
      });

      // If the goal has analysis data, set it
      if (existingGoal.time_to_goal && existingGoal.daily_savings) {
        setAnalysis({
          dailySavings: existingGoal.daily_savings,
          dailyMaxExpense: existingGoal.daily_max_expense,
          totalCost: existingGoal.totalCost,
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
      setStreamedResponse('');
      setStreamComplete(false);
      setIsProcessingFinal(false);

      // Step 1: Start AI analysis with event-stream for raw output
      const streamResponse = await fetch(`/${locale}/api/analyze-goal-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          targetAmount: type === 'savings' ? parseFloat(formData.targetAmount) : null,
          monthlyIncome: parseFloat(formData.monthlyIncome),
          description: formData.description,
          useStream: true,
          locale,
        }),
      });

      if (!streamResponse.ok) {
        throw new Error('Stream analysis failed');
      }

      // Process the event stream to collect raw LLM output
      let rawLlmOutput = '';
      if (streamResponse.headers.get('Content-Type')?.includes('text/event-stream')) {
        const reader = streamResponse.body?.getReader();
        const decoder = new TextDecoder();

        // Process the event stream
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                // setStreamComplete(true);
                break;
              }

              // Decode the chunk
              const chunk = decoder.decode(value, { stream: true });

              rawLlmOutput += chunk;
              setStreamedResponse(prev => prev + chunk);
            }
          } catch (error) {
            console.error('Error reading stream:', error);
            toast.error(t('errorStreamAnalysis'));
          }
        }
      }

      // Step 2: Use the original API with the raw LLM output as context
      if (rawLlmOutput) {
        setIsProcessingFinal(true);

        const finalResponse = await fetch(`/${locale}/api/analyze-goal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            targetAmount: type === 'savings' ? parseFloat(formData.targetAmount) : null,
            monthlyIncome: parseFloat(formData.monthlyIncome),
            description: formData.description,
            context: rawLlmOutput, // Use the raw LLM output as context
            locale: locale,
          }),
        });

        if (!finalResponse.ok) {
          throw new Error('Final analysis failed');
        }

        const analysisResult = await finalResponse.json();
        setStreamComplete(true);

        // Calculate total cost from timeToGoal and dailySavings
        let totalCost = analysisResult.totalCost;

        // If savings type with target amount, use that as priority
        if (type === 'savings' && formData.targetAmount) {
          totalCost = parseFloat(formData.targetAmount);
        }

        setAnalysis({
          ...analysisResult,
          rawLlmOutput,
          totalCost
        });

        setIsProcessingFinal(false);
      } else {
        throw new Error('No raw output obtained from stream');
      }

      setIsAnalyzing(false);

    } catch (error) {
      console.error('Error:', error);
      if ((error as Error).message === 'Final analysis failed') {
        toast.error(t('errorFinalAnalysis'));
      } else {
        toast.error(t('errorAnalyzing'));
      }
      setIsAnalyzing(false);
      setIsProcessingFinal(false);
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
        formData.monthlyIncome.trim() !== ''
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
        target_amount: type === 'savings' ? parseFloat(formData.targetAmount) : analysis?.totalCost,
        monthly_income: parseFloat(formData.monthlyIncome),
        description: formData.description,
        time_to_goal: ((type === 'savings' ? parseFloat(formData.targetAmount) : analysis?.totalCost!) / analysis?.dailySavings!).toFixed(0),
        daily_savings: analysis?.dailySavings,
        daily_max_expense: analysis?.dailyMaxExpense,
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

      router.push(`/${locale}/wishlist2`);
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
          <div className="text">
            {isProcessingFinal ? t('processingFinalAnalysis') : t('analyzing')}
          </div>
          <div className="subtext">
            {isProcessingFinal
              ? t('analyzingDescription')
              : t('analyzingDescription')}
          </div>

          {/* {streamedResponse && (
            <div className="streaming-container">
              <div className="stream-title">
                <span>{t('rawResponse')}</span>
                {!streamComplete && (
                  <span className="streaming-indicator">
                    <span className="dot"></span>
                    {t('streaming')}
                  </span>
                )}
              </div>
              <div
                className={`stream-content ${!streamComplete ? 'is-streaming' : ''}`}
                ref={streamContentRef}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
                  {streamedResponse}
                </ReactMarkdown>
              </div>
            </div>
          )} */}
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
              {
                analysis.dailySavings ? (
                  <>
                    <div className="metric">
                      <div className="value">¥{analysis.totalCost}</div>
                      <div className="label">{t('totalCost')}</div>
                    </div>
                    <div className="metric">
                      <div className="value">{Math.floor(analysis.totalCost / analysis.dailySavings)} {t('days')}</div>
                      <div className="label">{t('estimatedTime')}</div>
                    </div>
                    <div className="metric">
                      <div className="value">¥{analysis.dailySavings}</div>
                      <div className="label">{t('dailySavings')}</div>
                    </div>
                    <div className="metric">
                      <div className="value">¥{analysis.dailyMaxExpense}</div>
                      <div className="label">{t('dailyMaxExpense')}</div>
                    </div>
                  </>
                ) : null
              }
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

          {/* Display raw LLM response at the bottom */}
          {/* {analysis.rawLlmOutput && (
            <div className="section">
              <div className="title">{t('rawAnalysis')}</div>
              <div className="content raw-response">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                >
                  {analysis.rawLlmOutput}
                </ReactMarkdown>
              </div>
            </div>
          )} */}
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

        {/* <FormGroup>
          <div className="label">{t('goalDescription')}</div>
          <textarea
            name="description"
            className="input"
            placeholder={t('enterGoalDescription')}
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup> */}

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