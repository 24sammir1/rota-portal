// Run this script once to create the initial admin user
// Usage: node scripts/create-admin.js

const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const db = createClient({
  url: process.env.DATABASE_URL || 'file:./data.db',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function initDb() {
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
}

async function main() {
  console.log('\n=== Rota Portal Admin Setup ===\n');
  
  await initDb();
  console.log('Database initialized.\n');

  // Check for existing admin
  const existing = await db.execute({
    sql: "SELECT * FROM users WHERE role = 'admin'",
    args: [],
  });

  if (existing.rows.length > 0) {
    console.log('An admin user already exists:');
    console.log(`  Username: ${existing.rows[0].username}`);
    console.log(`  Name: ${existing.rows[0].name}`);
    
    const overwrite = await question('\nCreate another admin? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('\nSetup complete.');
      rl.close();
      process.exit(0);
    }
  }

  const username = await question('Admin username: ');
  const password = await question('Admin password: ');
  const name = await question('Admin full name: ');

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute({
    sql: `INSERT INTO users (username, password, name, role, approved) VALUES (?, ?, ?, 'admin', 1)`,
    args: [username, hashedPassword, name],
  });

  console.log(`\n✓ Admin user "${username}" created successfully!`);
  console.log('\nYou can now run the app with: npm run dev');
  console.log('Then log in at: http://localhost:3000/login\n');

  rl.close();
}

main().catch(console.error);
