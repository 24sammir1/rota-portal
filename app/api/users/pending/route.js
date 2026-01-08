import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const timestamp = Date.now();
  try {
    const sql = neon(process.env.DATABASE_URL);
    const countResult = await sql`SELECT COUNT(*) as total FROM users`;
    const pendingCount = await sql`SELECT COUNT(*) as pending FROM users WHERE status = 'pending'`;
    const dbUrl = new URL(process.env.DATABASE_URL);

    const users = await sql`
      SELECT id, username, name, phone, created_at
      FROM users
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      {
        users,
        totalUsers: countResult[0].total,
        pendingUsers: pendingCount[0].pending,
        timestamp
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Db-Host': dbUrl.hostname
        }
      }
    );
    
  } catch (error) {
    console.error('Fetch pending users error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending users', details: error.message }, { status: 500 });
  }
}
