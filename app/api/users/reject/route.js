import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const timestamp = Date.now();
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
    const dbUrl = new URL(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);

    // Fingerprint + visibility checks
    const metaRows = await sql`select current_database() as db, current_schema() as schema`;
    const searchPathRows = await sql`show search_path`;
    const hasBeforeRows = await sql`
      select exists(select 1 from public.users where id = ${userId}) as has_before
    `;

    // Try delete from the real table
    const deletedRows = await sql`
      delete from public.users
      where id = ${userId}
      returning id
    `;

    const hasAfterRows = await sql`
      select exists(select 1 from public.users where id = ${userId}) as has_after
    `;

    return NextResponse.json(
      {
        ok: true,
        meta: {
          db: metaRows?.[0]?.db ?? null,
          schema: metaRows?.[0]?.schema ?? null,
          search_path: searchPathRows?.[0]?.search_path ?? null,
          db_host: dbUrl.hostname,
        },
        userId,
        has_before: hasBeforeRows?.[0]?.has_before ?? null,
        deleted_ids: deletedRows?.map(r => r.id) ?? [],
        has_after: hasAfterRows?.[0]?.has_after ?? null,
        timestamp,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Db-Host': dbUrl.hostname,
        },
      }
    );

  } catch (error) {
    console.error('Reject user error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to reject user', details: error.message }, { status: 500 });
  }
}
