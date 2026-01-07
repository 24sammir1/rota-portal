import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const dbUrl = new URL(process.env.DATABASE_URL);

    const result = await sql`
      DELETE FROM users
      WHERE id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: true, message: 'User already processed' },
        {
          status: 200,
          headers: { 'X-Db-Host': dbUrl.hostname }
        }
      );
    }

    return NextResponse.json(
      { success: true, message: 'User rejected' },
      { headers: { 'X-Db-Host': dbUrl.hostname } }
    );
    
  } catch (error) {
    console.error('Reject user error:', error);
    return NextResponse.json({ error: 'Failed to reject user', details: error.message }, { status: 500 });
  }
}
