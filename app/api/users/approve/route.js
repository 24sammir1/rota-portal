import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { userId, name } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    if (name) {
      await sql`
        UPDATE users 
        SET status = 'approved', name = ${name}
        WHERE id = ${userId}
      `;
    } else {
      await sql`
        UPDATE users 
        SET status = 'approved'
        WHERE id = ${userId}
      `;
    }
    
    return NextResponse.json({ success: true, message: 'User approved' });
    
  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json({ error: 'Failed to approve user', details: error.message }, { status: 500 });
  }
}
