import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    const users = await sql`
      SELECT id, username, name, role, status, created_at
      FROM users 
      WHERE status IN ('approved', 'deactivated')
      ORDER BY name ASC
    `;
    
    return NextResponse.json({ users });
    
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
