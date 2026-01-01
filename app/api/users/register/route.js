import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
};

export async function POST(request) {
  try {
    const { username, password, name, phone, emergencyContact } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sql = neon(getDatabaseUrl());

    // Check if username exists
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (not approved by default)
    await sql`
      INSERT INTO users (username, password, name, phone, emergency_contact, approved)
      VALUES (${username}, ${hashedPassword}, ${name}, ${phone || null}, ${emergencyContact || null}, 0)
    `;

    return NextResponse.json({ success: true, message: 'Registration successful. Awaiting admin approval.' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
