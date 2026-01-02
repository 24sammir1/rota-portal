import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // For now, just check if there's a session cookie present
    // The admin page already checks auth on the client side
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized - no session' }, { status: 401 });
    }
    
    const data = await request.json();
    
    if (!data.weekEnding) {
      return NextResponse.json({ error: 'Missing weekEnding field' }, { status: 400 });
    }
    
    if (!data.staff || !Array.isArray(data.staff)) {
      return NextResponse.json({ error: 'Missing or invalid staff array' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    const existing = await sql`
      SELECT id FROM rotas WHERE week_ending = ${data.weekEnding}
    `;
    
    if (existing.length > 0) {
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
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    const rotas = await sql`
      SELECT id, week_ending, sheet_name, type, uploaded_at,
             jsonb_array_length(staff_data) as staff_count
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
