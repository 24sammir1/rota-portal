import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, action, role } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'approve') {
      const userRole = role || 'staff';
      await sql`
        UPDATE users 
        SET approved = 1, role = ${userRole}
        WHERE id = ${userId}
      `;
      return NextResponse.json({ success: true, message: 'User approved' });
    } else if (action === 'decline') {
      await sql`DELETE FROM users WHERE id = ${userId}`;
      return NextResponse.json({ success: true, message: 'User declined and removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
