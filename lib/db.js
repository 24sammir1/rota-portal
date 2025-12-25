import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.DATABASE_URL || 'file:./data.db',
});

// Initialize database tables
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      emergency_contact TEXT,
      availability TEXT,
      role TEXT DEFAULT 'staff' CHECK(role IN ('staff', 'supervisor', 'admin')),
      approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS rota_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_ending TEXT NOT NULL,
      data TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS staff_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_name TEXT NOT NULL,
      allowed_roles TEXT,
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS time_off_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'declined')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      actioned_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS swap_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER NOT NULL,
      target_id INTEGER NOT NULL,
      requester_shift_date TEXT NOT NULL,
      requester_shift_time TEXT NOT NULL,
      target_shift_date TEXT NOT NULL,
      target_shift_time TEXT NOT NULL,
      target_approved INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending_target' CHECK(status IN ('pending_target', 'pending_admin', 'approved', 'declined', 'expired')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      target_responded_at DATETIME,
      actioned_at DATETIME,
      FOREIGN KEY (requester_id) REFERENCES users(id),
      FOREIGN KEY (target_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS supervisor_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supervisor_id INTEGER NOT NULL,
      staff_name TEXT NOT NULL,
      change_date TEXT NOT NULL,
      original_shift TEXT,
      new_shift TEXT,
      reason TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'actioned')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      actioned_at DATETIME,
      FOREIGN KEY (supervisor_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      expiry_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized');
}

export default db;
