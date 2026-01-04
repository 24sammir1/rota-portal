import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Delete the pending user
    await sql`DELETE FROM users WHERE id = ${userId} AND status = 'pending'`;
    
    return NextResponse.json({ success: true, message: 'User rejected' });
    
  } catch (error) {
    console.error('Reject user error:', error);
    return NextResponse.json({ error: 'Failed to reject user' }, { status: 500 });
  }
}
