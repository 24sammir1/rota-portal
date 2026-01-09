import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);

    const users = await sql`
      SELECT id, username, name, phone, created_at
      FROM users
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      { users },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Pending users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
