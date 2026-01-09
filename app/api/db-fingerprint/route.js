import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conn = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
    if (!conn) {
      return NextResponse.json(
        { ok: false, error: 'Missing DATABASE_URL / DATABASE_URL_UNPOOLED' },
        { status: 500 }
      );
    }

    const sql = neon(conn);

    const metaRows = await sql`
      select
        current_database() as db,
        current_schema() as schema,
        inet_server_addr()::text as server_ip,
        inet_server_port() as server_port,
        version() as pg_version
    `;

    const searchPathRows = await sql`show search_path`;
    const usersCountRows = await sql`select count(*)::int as users_count from users`;
    const idsRows = await sql`select coalesce(array_agg(id order by id), '{}') as ids from users`;
    const has15Rows = await sql`select exists(select 1 from users where id=15) as has_15`;
    const has16Rows = await sql`select exists(select 1 from users where id=16) as has_16`;

    return NextResponse.json({
      ok: true,
      vercel: {
        env: process.env.VERCEL_ENV ?? null,
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      },
      meta: metaRows[0] ?? null,
      search_path: searchPathRows?.[0]?.search_path ?? null,
      users: {
        users_count: usersCountRows?.[0]?.users_count ?? null,
        ids: idsRows?.[0]?.ids ?? null,
        has_15: has15Rows?.[0]?.has_15 ?? null,
        has_16: has16Rows?.[0]?.has_16 ?? null,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
