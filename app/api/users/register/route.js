import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password, name, phone, emergencyContact } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if username exists
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    
    if (existing.rows.length > 0) {
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
