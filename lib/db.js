import { sql } from '@vercel/postgres';

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
      role TEXT DEFAULT 'staff' CHECK(role IN ('staff', 'supervisor', 'admin')),
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
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'declined')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actioned_at TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
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
      status TEXT DEFAULT 'pending_target' CHECK(status IN ('pending_target', 'pending_admin', 'approved', 'declined', 'expired')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      target_responded_at TIMESTAMP,
      actioned_at TIMESTAMP,
      FOREIGN KEY (requester_id) REFERENCES users(id),
      FOREIGN KEY (target_id) REFERENCES users(id)
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
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'actioned')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actioned_at TIMESTAMP,
      FOREIGN KEY (supervisor_id) REFERENCES users(id)
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

export default sql;
