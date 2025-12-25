import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    const status = action === 'approve' ? 'approved' : 'declined';

    await db.execute({
      sql: 'UPDATE time_off_requests SET status = ?, actioned_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [status, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Time off action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
