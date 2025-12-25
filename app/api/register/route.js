import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db, { initDb } from '@/lib/db';

export async function POST(request) {
  try {
    await initDb();
    
    const { username, password, name, phone } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (not approved by default)
    await db.execute({
      sql: 'INSERT INTO users (username, password, name, phone, approved) VALUES (?, ?, ?, ?, 0)',
      args: [username, hashedPassword, name, phone || null],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
