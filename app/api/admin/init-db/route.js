import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST(request) {
  try {
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
