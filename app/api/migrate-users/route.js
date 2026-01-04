import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Add status column to users table if it doesn't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved'
    `;
    
    // Update existing users to have 'approved' status
    await sql`
      UPDATE users SET status = 'approved' WHERE status IS NULL
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Users table updated with status column' 
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
}
