import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { initDb } from '@/lib/db';

const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
};

export async function POST(request) {
  try {
    const { username, password, name, setupKey } = await request.json();
    
    // Simple setup key check - you can change this or remove after first setup
    if (setupKey !== 'setup-rota-2024') {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 });
    }
    
    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize database tables first
    await initDb();

    const sql = neon(getDatabaseUrl());

    // Check if admin already exists
    const existing = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await sql`
      INSERT INTO users (username, password, name, role, approved)
      VALUES (${username}, ${hashedPassword}, ${name}, 'admin', 1)
    `;

    return NextResponse.json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
