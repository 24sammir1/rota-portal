import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db, { initDb } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();

    const result = await db.execute({
      sql: 'SELECT name, phone, emergency_contact, availability FROM users WHERE id = ?',
      args: [session.user.id],
    });

    return NextResponse.json(result.rows[0] || {});
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, emergencyContact, availability } = await request.json();

    await db.execute({
      sql: 'UPDATE users SET name = ?, phone = ?, emergency_contact = ?, availability = ? WHERE id = ?',
      args: [name, phone || null, emergencyContact || null, availability || null, session.user.id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
