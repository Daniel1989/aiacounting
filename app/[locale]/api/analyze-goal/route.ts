import { createClient } from '@/app/lib/supabase/server';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request, { params }: { params: { locale: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { type, targetAmount, monthlyIncome, description } = await request.json();
    const { locale } = params;
    
    // Get last 90 days of records
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user.id)
      .gte('updated_at', ninetyDaysAgo.toISOString())
      .order('updated_at', { ascending: false });
      
    if (recordsError) {
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }
    // Calculate spending patterns
    const totalExpenses = records
      .filter(record => record.type === 'expense')
      .reduce((sum, record) => sum + record.amount, 0);
    const avgMonthlyExpense = totalExpenses / 3; // 90 days = 3 months
    const avgDailyExpense = avgMonthlyExpense / 30; // Average daily expense

    // Prepare spending breakdown
    const spendingBreakdown = records
      .filter(record => record.type === 'expense')
      .reduce((acc: Record<string, number>, record) => {
        acc[record.category] = (acc[record.category] || 0) + record.amount;
        return acc;
      }, {});
    
    const breakdownText = Object.entries(spendingBreakdown)
      .map(([category, amount]) => `- ${category}: ${amount.toFixed(2)}`)
      .join('\n');

    // Determine language for the prompt
    const language = locale === 'zh' ? 'Chinese' : 'English';
    
    // Prepare the prompt for OpenAI
    const prompt = `As a financial advisor, analyze this user's goal and spending patterns. 
Respond in ${language} language.

Goal Type: ${type}
${targetAmount ? `Target Amount: ${targetAmount}` : ''}
Monthly Income: ${monthlyIncome}
Goal Description: ${description}

Current Financial Status:
- Average Monthly Expenses: ${avgMonthlyExpense.toFixed(2)}
- Average Daily Expenses: ${avgDailyExpense.toFixed(2)}
- Last 90 Days Total Expenses: ${totalExpenses.toFixed(2)}

Detailed spending breakdown:
${breakdownText}

Please provide:
1. Estimated time to achieve the goal (in days)
2. Recommended daily savings amount
3. Specific suggestions to reduce expenses based on their spending patterns
4. List of actionable steps to achieve the goal faster
5. Potential challenges and how to overcome them

Format the response in JSON with the following structure:
{
  "timeToGoal": number,
  "dailySavings": number,
  "suggestions": string[],
  "actionableSteps": string[],
  "challenges": [{"challenge": string, "solution": string}]
}

Remember to respond in ${language} language.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }
    
    const analysis = JSON.parse(content);
    
    // Store the analysis result
    const { error: analysisError } = await supabase
      .from('goal_analyses')
      .insert({
        user_id: user.id,
        goal_type: type,
        target_amount: targetAmount,
        monthly_income: monthlyIncome,
        time_to_goal: analysis.timeToGoal,
        daily_savings: analysis.dailySavings,
        suggestions: analysis.suggestions,
        actionable_steps: analysis.actionableSteps,
        challenges: analysis.challenges,
        created_at: new Date().toISOString()
      });

    if (analysisError) {
      console.error('Error storing analysis:', analysisError);
    }
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.log('Error:', error);
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
} 