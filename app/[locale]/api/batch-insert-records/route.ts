import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/lib/server';
import { createClient } from '@/app/lib/supabase/server';

interface RecordItem {
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  date?: string;
  tag_id?: number;
}

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
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No valid items provided' },
        { status: 400 }
      );
    }

    // Get tags from the database to match with categories
    const supabase = await createClient();
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*');

    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      );
    }

    // Prepare records for insertion
    const records = items.map((item: RecordItem) => {
      // Find matching tag for the category
      const matchingTags = tags.filter(tag => 
        tag.name === item.category && 
        tag.category === (item.type === 'expense' ? 'cost' : 'income')
      );
      
      // Use the first matching tag or default to null
      const tagId = matchingTags.length > 0 ? matchingTags[0].id : null;
      if(!tagId) {
        return null;
      }
      return {
        user_id: user.id,
        amount: item.amount,
        // type: item.type === 'expense' ? 'cost' : 'income',
        category: item.type === 'expense' ? 'cost' : 'income',
        tag_id: tagId,
        note: item.description,
        // date: item.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };
    });

    // Filter out null records
    const filteredRecords = records.filter(record => record !== null);

    // Insert records into the database
    const { data, error } = await supabase
      .from('records')
      .insert(filteredRecords)
      .select();

    if (error) {
      console.error('Error inserting records:', error);
      return NextResponse.json(
        { error: 'Failed to insert records' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount: records.length,
      records: data
    });
  } catch (error) {
    console.error('Error processing batch insert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 