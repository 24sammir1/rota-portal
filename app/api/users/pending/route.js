import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
};

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(getDatabaseUrl());
    const result = await sql`
      SELECT id, username, name, phone, created_at 
      FROM users 
      WHERE approved = 0 AND role != 'admin'
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error('Fetch pending users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
