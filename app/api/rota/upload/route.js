import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Parse the JSON data
    const data = await request.json();
    
    // Validate required fields
    if (!data.weekEnding) {
      return NextResponse.json({ error: 'Missing weekEnding field' }, { status: 400 });
    }
    
    if (!data.staff || !Array.isArray(data.staff)) {
      return NextResponse.json({ error: 'Missing or invalid staff array' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Check if rota for this week already exists
    const existing = await sql`
      SELECT id FROM rotas WHERE week_ending = ${data.weekEnding}
    `;
    
    if (existing.length > 0) {
      // Update existing rota
      await sql`
        UPDATE rotas 
        SET 
          sheet_name = ${data.sheetName || null},
          type = ${data.type || 'planned'},
          staff_data = ${JSON.stringify(data.staff)},
          uploaded_at = NOW()
        WHERE week_ending = ${data.weekEnding}
      `;
    } else {
      // Insert new rota
      await sql`
        INSERT INTO rotas (week_ending, sheet_name, type, staff_data, uploaded_at)
        VALUES (
          ${data.weekEnding},
          ${data.sheetName || null},
          ${data.type || 'planned'},
          ${JSON.stringify(data.staff)},
          NOW()
        )
      `;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Rota for week ending ${data.weekEnding} uploaded successfully`,
      staffCount: data.staff.length
    });
    
  } catch (error) {
    console.error('Rota upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload rota', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Get list of uploaded rotas
    const rotas = await sql`
      SELECT id, week_ending, sheet_name, type, uploaded_at,
             json_array_length(staff_data) as staff_count
      FROM rotas 
      ORDER BY week_ending DESC
      LIMIT 20
    `;
    
    return NextResponse.json({ rotas });
    
  } catch (error) {
    console.error('Rota fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch rotas', 
      details: error.message 
    }, { status: 500 });
  }
}
