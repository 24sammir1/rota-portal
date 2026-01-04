import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { userId, name } = await request.json();
    
    if (!userId || !name) {
      return NextResponse.json({ error: 'User ID and name required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    await sql`UPDATE users SET name = ${name} WHERE id = ${userId}`;
    
    return NextResponse.json({ success: true, message: 'User updated' });
    
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user', details: error.message }, { status: 500 });
  }
}
