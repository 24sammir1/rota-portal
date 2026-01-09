import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);

    const result = await sql`
      DELETE FROM users
      WHERE id = ${userId}
      RETURNING id
    `;

    return NextResponse.json(
      {
        success: true,
        deleted: result.length > 0,
        deletedId: result[0]?.id || null
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
