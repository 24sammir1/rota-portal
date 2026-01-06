import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name } = body || {};

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    if (name && String(name).trim().length > 0) {
      await sql`
        UPDATE users
        SET status = 'approved', name = ${String(name).trim()}
        WHERE id = ${userId}
      `;
    } else {
      await sql`
        UPDATE users
        SET status = 'approved'
        WHERE id = ${userId}
      `;
    }

    return NextResponse.json({ success: true, message: 'User approved' });
  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json(
      { error: 'Failed to approve user', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
