import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_name TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_relation TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_phone TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS existing_staff BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS start_date DATE`;
    return NextResponse.json({ success: true, message: 'User fields added' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
