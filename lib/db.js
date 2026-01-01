import { neon } from '@neondatabase/serverless';

// Get the database URL (try multiple environment variable names)
const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
};

// Create a SQL query function
const sql = neon(getDatabaseUrl());

// Initialize database tables
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      emergency_contact TEXT,
      availability TEXT,
      role TEXT DEFAULT 'staff',
      approved INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rota_data (
      id SERIAL PRIMARY KEY,
      week_ending TEXT NOT NULL,
      data TEXT NOT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS staff_roles (
      id SERIAL PRIMARY KEY,
      staff_name TEXT NOT NULL,
      allowed_roles TEXT,
      notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS time_off_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actioned_at TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS swap_requests (
      id SERIAL PRIMARY KEY,
      requester_id INTEGER NOT NULL,
      target_id INTEGER NOT NULL,
      requester_shift_date TEXT NOT NULL,
      requester_shift_time TEXT NOT NULL,
      target_shift_date TEXT NOT NULL,
      target_shift_time TEXT NOT NULL,
      target_approved INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending_target',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      target_responded_at TIMESTAMP,
      actioned_at TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS supervisor_changes (
      id SERIAL PRIMARY KEY,
      supervisor_id INTEGER NOT NULL,
      staff_name TEXT NOT NULL,
      change_date TEXT NOT NULL,
      original_shift TEXT,
      new_shift TEXT,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actioned_at TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      expiry_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('Database initialized');
}

export { sql };
export default sql;
