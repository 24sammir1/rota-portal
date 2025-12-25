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

    const data = await request.json();

    if (!data.weekEnding) {
      return NextResponse.json({ error: 'Week ending date is required' }, { status: 400 });
    }

    // Check if we already have this week
    const existing = await db.execute({
      sql: 'SELECT id FROM rota_data WHERE week_ending = ?',
      args: [data.weekEnding],
    });

    if (existing.rows.length > 0) {
      // Update existing
      await db.execute({
        sql: 'UPDATE rota_data SET data = ?, uploaded_at = CURRENT_TIMESTAMP WHERE week_ending = ?',
        args: [JSON.stringify(data), data.weekEnding],
      });
    } else {
      // Insert new
      await db.execute({
        sql: 'INSERT INTO rota_data (week_ending, data) VALUES (?, ?)',
        args: [data.weekEnding, JSON.stringify(data)],
      });
    }

    // Also update staff roles if provided
    if (data.staffRoles && Array.isArray(data.staffRoles)) {
      // Clear existing roles
      await db.execute({ sql: 'DELETE FROM staff_roles', args: [] });
      
      // Insert new roles
      for (const role of data.staffRoles) {
        await db.execute({
          sql: 'INSERT INTO staff_roles (staff_name, allowed_roles, notes) VALUES (?, ?, ?)',
          args: [role.name, role.roles || null, role.notes || null],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rota upload error:', error);
    return NextResponse.json({ error: 'Failed to upload rota' }, { status: 500 });
  }
}
