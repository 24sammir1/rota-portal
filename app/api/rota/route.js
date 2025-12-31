import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch rota data
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekEnding = searchParams.get('week');

    let result;
    if (weekEnding) {
      result = await sql`
        SELECT * FROM rota_data 
        WHERE week_ending = ${weekEnding}
        ORDER BY uploaded_at DESC 
        LIMIT 1
      `;
    } else {
      // Get most recent 2 weeks
      result = await sql`
        SELECT * FROM rota_data 
        ORDER BY uploaded_at DESC 
        LIMIT 2
      `;
    }

    return NextResponse.json({ rota: result.rows });
  } catch (error) {
    console.error('Fetch rota error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Upload new rota data
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weekEnding, data } = await request.json();

    if (!weekEnding || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delete old data for same week
    await sql`DELETE FROM rota_data WHERE week_ending = ${weekEnding}`;

    // Insert new data
    await sql`
      INSERT INTO rota_data (week_ending, data)
      VALUES (${weekEnding}, ${JSON.stringify(data)})
    `;

    return NextResponse.json({ success: true, message: 'Rota uploaded successfully' });
  } catch (error) {
    console.error('Upload rota error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
