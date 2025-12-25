import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db, { initDb } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();

    const { title, content, expiryDate } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await db.execute({
      sql: 'INSERT INTO announcements (title, content, expiry_date) VALUES (?, ?, ?)',
      args: [title, content, expiryDate || null],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Announcement error:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
