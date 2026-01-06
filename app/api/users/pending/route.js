import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    const users = await sql`
      SELECT id, username, name, phone, created_at
      FROM users 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Fetch pending users error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending users', details: error.message }, { status: 500 });
  }
}
