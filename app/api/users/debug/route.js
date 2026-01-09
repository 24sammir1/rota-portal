import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const timestamp = Date.now();
  try {
    const sql = neon(process.env.DATABASE_URL);
    const dbUrl = new URL(process.env.DATABASE_URL);

    const users = await sql`
      SELECT id, username, status
      FROM users
      ORDER BY id DESC
      LIMIT 10
    `;

    return NextResponse.json(
      { users, timestamp },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Db-Host': dbUrl.hostname
        }
      }
    );

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}
