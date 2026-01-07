import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  try {
    const { name, phone, address, dob, emergencyName, emergencyRelation, emergencyPhone, existingStaff, startDate, username, password } = await request.json();
    if (!name || !phone || !username || !password) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        {
          status: 400,
          headers: {
            'X-Db-Host': dbUrl.hostname
          }
        }
      );
    }
    const sql = neon(process.env.DATABASE_URL);
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        {
          status: 400,
          headers: {
            'X-Db-Host': dbUrl.hostname
          }
        }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await sql`
      INSERT INTO users (username, password, name, phone, address, dob, emergency_name, emergency_relation, emergency_phone, existing_staff, start_date, role, status)
      VALUES (${username}, ${hashedPassword}, ${name}, ${phone}, ${address}, ${dob || null}, ${emergencyName}, ${emergencyRelation}, ${emergencyPhone}, ${existingStaff || false}, ${startDate || null}, 'staff', 'pending')
      RETURNING id, status
    `;
    const pendingCountResult = await sql`
      SELECT COUNT(*)::int AS pending_count FROM users WHERE status='pending'
    `;
    return NextResponse.json(
      {
        success: true,
        created: created[0],
        pendingCount: pendingCountResult[0].pending_count,
        dbHost: dbUrl.hostname
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Db-Host': dbUrl.hostname
        }
      }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      {
        status: 500,
        headers: {
          'X-Db-Host': dbUrl.hostname
        }
      }
    );
  }
}
