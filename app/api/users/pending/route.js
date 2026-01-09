import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const timestamp = Date.now();
  try {
    // Use unpooled connection to bypass pooler and read directly from primary
    const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
    const dbUrl = new URL(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);

    const users = await sql`
      SELECT id, username, name, phone, created_at
      FROM users
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      {
        users,
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
