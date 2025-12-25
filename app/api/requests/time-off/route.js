import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db, { initDb } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initDb();
    
    const { startDate, endDate, reason } = await request.json();

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required' },
        { status: 400 }
      );
    }

    await db.execute({
      sql: `INSERT INTO time_off_requests (user_id, start_date, end_date, reason) 
            VALUES (?, ?, ?, ?)`,
      args: [session.user.id, startDate, endDate || startDate, reason || null],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Time off request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}
