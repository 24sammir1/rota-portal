import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Create rotas table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS rotas (
        id SERIAL PRIMARY KEY,
        week_ending DATE NOT NULL UNIQUE,
        sheet_name VARCHAR(50),
        type VARCHAR(20) DEFAULT 'planned',
        staff_data JSONB NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_rotas_week_ending ON rotas(week_ending DESC)
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Rotas table created/verified successfully' 
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 });
  }
}
