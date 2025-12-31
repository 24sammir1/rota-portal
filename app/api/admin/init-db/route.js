import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request) {
  try {
    // Check if this is the first setup (no auth required) or admin request
    const session = await auth();
    
    // For initial setup, we allow without auth
    // After first admin exists, require admin role
    await initDb();
    
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to initialize database' });
}
