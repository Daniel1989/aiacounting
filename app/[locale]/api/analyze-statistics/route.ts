import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import OpenAI from 'openai';
import { getTranslations } from 'next-intl/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const model = process.env.OPENAI_MODEL;

export async function POST(request: NextRequest) {
  try {
    
    // Get request body
    const { userId, locale } = await request.json();
    const t = await getTranslations({ locale, namespace: 'statistics' });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Get last 90 days of records with tag information
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: records, error } = await supabase
      .from('records')
      .select(`
        *,
        tags:tag_id (
          id,
          name,
          icon,
          category
        )
      `)
      .eq('user_id', userId)
      .gte('updated_at', ninetyDaysAgo.toISOString())
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching records:', error);
      return NextResponse.json(
        { error: 'Failed to fetch records' },
        { status: 500 }
      );
    }
    
    if (!records || records.length < 3) {
      return NextResponse.json({
        tips: [t('tips.keepTracking')],
        notEnoughData: true
      });
    }
    
    // Process records with tag information
    const processedRecords = records.map(record => ({
      ...record,
      category: record.tags?.category || 'unknown',
      tagName: record.tags?.name || 'unknown'
    }));
    
    // Calculate basic statistics for context
    const incomeRecords = processedRecords.filter(record => record.category === 'income');
    const expenseRecords = processedRecords.filter(record => record.category === 'cost');
    
    const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);
    const totalExpense = expenseRecords.reduce((sum, record) => sum + record.amount, 0);
    const balance = totalIncome - totalExpense;
    
    // Group expenses by category
    const expenseCategories: Record<string, number> = {};
    expenseRecords.forEach(record => {
      expenseCategories[record.tagName] = (expenseCategories[record.tagName] || 0) + record.amount;
    });
    
    // Group income by category
    const incomeCategories: Record<string, number> = {};
    incomeRecords.forEach(record => {
      incomeCategories[record.tagName] = (incomeCategories[record.tagName] || 0) + record.amount;
    });
    
    // Prepare data for AI analysis
    const financialData = {
      totalIncome,
      totalExpense,
      balance,
      recordCount: processedRecords.length,
      expenseCategories: Object.entries(expenseCategories)
        .map(([category, amount]) => ({ 
          category, 
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount),
      incomeCategories: Object.entries(incomeCategories)
        .map(([category, amount]) => ({ 
          category, 
          amount,
          percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount),
      hasSavings: balance > 0,
      timeSpan: '90 days'
    };
    
    // Generate AI analysis
    const prompt = `
      You are a financial advisor analyzing the last 90 days of a user's financial records.
      
      Here is their financial data:
      - Total Income: ${financialData.totalIncome.toFixed(2)}
      - Total Expenses: ${financialData.totalExpense.toFixed(2)}
      - Balance (Income - Expenses): ${financialData.balance.toFixed(2)}
      - Number of Records: ${financialData.recordCount}
      
      Top Expense Categories:
      ${financialData.expenseCategories.slice(0, 3).map(cat => 
        `- ${cat.category}: ${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}% of total expenses)`
      ).join('\n')}
      
      Top Income Categories:
      ${financialData.incomeCategories.slice(0, 3).map(cat => 
        `- ${cat.category}: ${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}% of total income)`
      ).join('\n')}
      
      Based on this data, provide 3-5 specific, actionable financial tips for the user. 
      Each tip should be concise (1-2 sentences) and directly related to their spending patterns.
      Focus on practical advice that can help them improve their financial situation.
      
      Format your response as a JSON array of strings, with each string being a single tip.
      Example: ["Tip 1", "Tip 2", "Tip 3"]
      
      The response should be in ${locale} language.
    `;
    const aiResponse = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful financial advisor." },
        { role: "user", content: prompt }
      ],
      model: model!,
      response_format: { type: "json_object" },
    });

    // Parse the AI response
    const content = aiResponse.choices[0].message.content;
    let tips: string[] = [];
    try {
      const parsedContent = JSON.parse(content || '{"tips":[]}');
      tips = Array.isArray(parsedContent) ? parsedContent : 
             Array.isArray(parsedContent.tips) ? parsedContent.tips : [];
    } catch (e) {
      console.error('Error parsing AI response:', e);
      // Fallback to basic tips if AI response parsing fails
      if (balance < 0) {
        tips.push(t('tips.spendingMoreThanEarning'));
      }
      
      if (financialData.expenseCategories.length > 0) {
        const topCategory = financialData.expenseCategories[0];
        if (topCategory.percentage > 40) {
          tips.push(t('tips.highExpenseCategory', { 
            percentage: Math.round(topCategory.percentage),
            category: topCategory.category
          }));
        }
      }
      
      if (balance > 0) {
        tips.push(t('tips.goodSavingHabits'));
      }
      
      if (tips.length === 0) {
        tips.push(t('tips.keepTracking'));
      }
    }
    
    return NextResponse.json({ tips });
    
  } catch (error) {
    console.error('Error in analyze-statistics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 