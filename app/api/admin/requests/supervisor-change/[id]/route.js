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

    await db.execute({
      sql: "UPDATE supervisor_changes SET status = 'actioned', actioned_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Supervisor change action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
