import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rotas = await sql`
      SELECT id, week_ending, sheet_name, type, staff_data, uploaded_at
      FROM rotas 
      ORDER BY week_ending DESC
      LIMIT 1
    `;
    return NextResponse.json({ rota: rotas[0] || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
