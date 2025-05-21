import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/server';
import { createClient } from '@/app/lib/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const model = process.env.OPENAI_VISION_MODEL;


export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { imageUrl, locale } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Get available tags/categories from the database
    const supabase = await createClient();
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return NextResponse.json(
        { error: '系统繁忙，请稍后再试' },
        { status: 500 }
      );
    }

    // Extract unique categories
    const expenseCategories = [...new Set(
      tags
        .filter(tag => tag.category === 'cost')
        .map(tag => tag.name)
    )];

    const incomeCategories = [...new Set(
      tags
        .filter(tag => tag.category === 'income')
        .map(tag => tag.name)
    )];

    // Prepare the prompt for OpenAI
    const systemPrompt = locale === 'zh' 
      ? `你是一个专业的收据分析助手。请分析图片中的收据或账单，并提取所有费用和收入项目。
      
      如果图片不是收据或账单，请回复："这不是一张收据或账单的图片。请上传包含费用或收入信息的图片。"
      
      如果是收据或账单，请按以下JSON格式返回识别到的项目：
      {
        "isReceipt": true,
        "items": [
          {
            "description": "项目描述",
            "amount": 金额(数字),
            "type": "expense"或"income",
            "category": "最匹配的类别",
            "date": "日期(YYYY-MM-DD格式，如果有)"
          }
        ]
      }
      
      可用的支出类别有: ${expenseCategories.join(', ')}
      可用的收入类别有: ${incomeCategories.join(', ')}
      
      请确保每个项目都分配到最匹配的类别。如果无法确定类别，请使用"other"。
      请确保金额是数字格式，不包含货币符号。
      如果收据上有日期，请以YYYY-MM-DD格式提供。如果没有日期，请省略该字段。`
      
      : `You are a professional receipt analysis assistant. Please analyze the receipt or bill in the image and extract all expense and income items.
      
      If the image is not a receipt or bill, please respond with: "This is not an image of a receipt or bill. Please upload an image containing expense or income information."
      
      If it is a receipt or bill, please return the recognized items in the following JSON format:
      {
        "isReceipt": true,
        "items": [
          {
            "description": "item description",
            "amount": amount(number),
            "type": "expense" or "income",
            "category": "best matching category",
            "date": "date(YYYY-MM-DD format, if available)"
          }
        ]
      }
      
      Available expense categories: ${expenseCategories.join(', ')}
      Available income categories: ${incomeCategories.join(', ')}
      
      Please ensure each item is assigned to the best matching category. If a category cannot be determined, use "other".
      Please ensure amounts are in numeric format, without currency symbols.
      If there is a date on the receipt, please provide it in YYYY-MM-DD format. If no date is available, omit this field.`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: model!,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this receipt image and extract all expense/income items:" },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Parse the response
    const content = response.choices[0].message.content || '';
    
    try {
      // Try to parse as JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = JSON.parse(jsonMatch[0]);
        return NextResponse.json(jsonContent);
      } else {
        // If not JSON, return the text response
        return NextResponse.json({
          isReceipt: false,
          message: content
        });
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return NextResponse.json({
        isReceipt: false,
        message: content
      });
    }
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    return NextResponse.json(
      { error: 'Failed to analyze receipt' },
      { status: 500 }
    );
  }
} 