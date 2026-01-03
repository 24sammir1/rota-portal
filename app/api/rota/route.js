import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Get the most recent rota
    const rotas = await sql`
      SELECT id, week_ending, sheet_name, type, staff_data, uploaded_at
      FROM rotas 
      ORDER BY week_ending DESC
      LIMIT 1
    `;
    
    if (rotas.length === 0) {
      return NextResponse.json({ rota: null });
    }
    
    return NextResponse.json({ rota: rotas[0] });
    
  } catch (error) {
    console.error('Rota fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch rota', 
      details: error.message 
    }, { status: 500 });
  }
}
