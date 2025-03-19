import { createClient } from '@/app/lib/supabase/server';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3/bots',
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { locale, type, targetAmount, monthlyIncome, description, useStream, context } = await request.json();
    console.log(locale, type, targetAmount, monthlyIncome, description, useStream, context);
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
    let prompt;
    
    if (context) {
      // If context is provided, use it for better analysis
      prompt = `You are a financial planning assistant. 
You've been given a raw analysis output about a user's financial goal.
Using this raw output as context, create a structured financial plan.

Raw analysis:
${context}

Goal Type: ${type}
${targetAmount ? `Target Amount: ${targetAmount}` : ''}
Monthly Income: ${monthlyIncome}
Goal Description: ${description}

Current Financial Status:
- Average Monthly Expenses: ${avgMonthlyExpense.toFixed(2)}
- Average Daily Expenses: ${avgDailyExpense.toFixed(2)}
- Last 90 Days Total Expenses: ${totalExpenses.toFixed(2)}

Please organize this information into a structured JSON format with the following structure:
{
  "timeToGoal": number,
  "dailySavings": number,
  "suggestions": string[],
  "actionableSteps": string[],
  "challenges": [{"challenge": string, "solution": string}]
}

Ensure the output is valid JSON and in ${language} language.`;
    } else {
      // Regular prompt without context
      prompt = `As a financial advisor, analyze this user's goal.  
Respond in ${language} language using **correct Markdown formatting**.  

### Goal Details:
- **Goal Type:** ${type}  
- **Goal Description:** ${description}  

### Instructions:
Please provide a **comprehensive analysis** with the following structure:  

1. **Detailed Breakdown of Expenses Needed to Achieve This Goal**  
   - Include a **well-formatted table** of estimated costs using the correct Markdown table syntax.  
   - Ensure table headers are aligned properly and avoid missing dividers.  

2. **Alternative similar goal that might be more affordable**  
   - Provide at least **two alternative options**.  
   - Use a **consistent list format** with bullet points ('-') or numbered lists ('1.').  
   - Clearly state the **pros and cons** of each option in a consistent format.  

### Formatting Guidelines:
- Use **consistent heading levels** (e.g., '###', '####') throughout the response.  
- Ensure that **table dividers** (using '|---|---|') are complete and properly aligned.  
- Avoid using extra separators ('---') or incorrect formatting characters.  
- Double-check that lists, bold/italic text, and other Markdown elements are **correctly formatted**.  

### Example Table Format:

Item	Estimated Cost	Notes
Item 1	$100 - $200	Description
Item 2	$150 - $300	Description

### Example List Format:
- **Option 1:** Description  
   - ✅ Advantage 1  
   - ❌ Disadvantage 1  

### Response Language:
Respond in **${language}**.  
`;
    }

    // Use streaming response - just stream the raw output without parsing
    if (useStream) {
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            // Use a different model for streaming if needed
            const completion = await deepseek.chat.completions.create({
              messages: [{ role: "user", content: prompt }],
              model: "bot-20250218193443-c7vhp",
              stream: true,
            });
            
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || '';
              
              // Send the chunk to the client
              controller.enqueue(encoder.encode(content));
            }
            
            // Stream complete, close the controller
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          }
        }
      });
      
      return new Response(customReadable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Regular API call without streaming - use the original implementation
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
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
} 