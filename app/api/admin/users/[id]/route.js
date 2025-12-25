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

    switch (action) {
      case 'approve':
        await db.execute({
          sql: 'UPDATE users SET approved = 1 WHERE id = ?',
          args: [id],
        });
        break;
      case 'reject':
        await db.execute({
          sql: 'DELETE FROM users WHERE id = ? AND approved = 0',
          args: [id],
        });
        break;
      case 'make-supervisor':
        await db.execute({
          sql: "UPDATE users SET role = 'supervisor' WHERE id = ?",
          args: [id],
        });
        break;
      case 'remove-supervisor':
        await db.execute({
          sql: "UPDATE users SET role = 'staff' WHERE id = ?",
          args: [id],
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
