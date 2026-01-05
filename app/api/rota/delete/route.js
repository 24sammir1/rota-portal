import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    const { rotaId } = await request.json();
    
    if (!rotaId) {
      return NextResponse.json({ error: 'Rota ID required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    await sql`DELETE FROM rotas WHERE id = ${rotaId}`;
    
    return NextResponse.json({ success: true, message: 'Rota deleted' });
    
  } catch (error) {
    console.error('Delete rota error:', error);
    return NextResponse.json({ error: 'Failed to delete rota', details: error.message }, { status: 500 });
  }
}
