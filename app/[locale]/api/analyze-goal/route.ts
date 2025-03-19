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
    // Get last 90 days of records
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: records, error: recordsError } = await supabase
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
      .eq('user_id', user.id)
      .gte('updated_at', ninetyDaysAgo.toISOString())
      .order('updated_at', { ascending: false });
      
    if (recordsError) {
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }


    const processedRecords = records.map(record => ({
      ...record,
      type: record.category || 'unknown',
      category: record.tags?.category || 'unknown',
      tagName: record.tags?.name || 'unknown'
    }));
    
    // Calculate spending patterns
    const totalExpenses = processedRecords
      .filter(record => record.type === 'cost')
      .reduce((sum, record) => sum + record.amount, 0);
    const avgMonthlyExpense = totalExpenses / 3; // 90 days = 3 months
    const avgDailyExpense = avgMonthlyExpense / 30; // Average daily expense
    

    const breakdownExpenses = processedRecords
      .filter(record => record.type === 'cost')
      .reduce((acc, record) => {
        acc[record.tagName] = (acc[record.tagName] || 0) + record.amount;
        return acc;
      }, {});
      
    // Determine language for the prompt
    const language = locale === 'zh' ? 'Chinese' : 'English';
    
    // Prepare the prompt for OpenAI
    let prompt;
    
    if (context) {
      // If context is provided, use it for better analysis
      prompt = `You are a financial planning assistant. 
You've been given a raw analysis output about a user's goal.
Using this raw output as context, create a structured financial plan based on the current financial status.

Raw analysis:
${context}

Goal Type: ${type}
${targetAmount ? `Target Amount: ${targetAmount}` : ''}
Monthly Income: ${monthlyIncome}
Goal Description: ${description}

Breakdown of User Current Expenses Habits:
${Object.entries(breakdownExpenses)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Current Financial Status:
- Average Monthly Expenses: ${avgMonthlyExpense.toFixed(2)}
- Average Daily Expenses: ${avgDailyExpense.toFixed(2)}
- Last 90 Days Total Expenses: ${totalExpenses.toFixed(2)}

Please use following steps to create a structured financial plan:
1. Analyze the raw analysis output and extract the total amount of money needed to achieve the goal.
2. Based on the total amount of money needed and the Monthly Income and Average Daily Expenses, calculate the daily savings needed to achieve the goal.
3. Based on the daily savings, calculate the time needed to achieve the goal.
4. Based on the daily savings, calculate a recommended maximum daily expense (dailyMaxExpense) the user should maintain to stay on track.
5. Based on the time needed, create a structured financial plan.

Please organize this information into a structured JSON format with the following structure:
{
  "timeToGoal": number,
  "dailySavings": number,
  "dailyMaxExpense": number,
  "suggestions": string[]
}

You should give 3 or 5 suggestions for the user to choose from.
At least one suggestion should be a variation of the goal, such as a different time period or a different amount.
At least one suggestion should be how to reduce the daily expense based on the breakdown of user current expenses habits.

Ensure the output is valid JSON and each field value in correct type and in ${language} language.`;
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
      console.log('prompt', prompt);
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
          daily_max_expense: analysis.dailyMaxExpense,
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