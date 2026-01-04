import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    if (action === 'deactivate') {
      await sql`UPDATE users SET status = 'deactivated' WHERE id = ${userId}`;
      return NextResponse.json({ success: true, message: 'User deactivated' });
    } else if (action === 'reactivate') {
      await sql`UPDATE users SET status = 'approved' WHERE id = ${userId}`;
      return NextResponse.json({ success: true, message: 'User reactivated' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Deactivate user error:', error);
    return NextResponse.json({ error: 'Failed to update user status', details: error.message }, { status: 500 });
  }
}
