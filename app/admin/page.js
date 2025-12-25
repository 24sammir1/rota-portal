import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db, { initDb } from '@/lib/db';
import Header from '../components/Header';
import AdminTabs from './AdminTabs';

async function getPendingUsers() {
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE approved = 0 ORDER BY created_at DESC',
    args: [],
  });
  return result.rows;
}

async function getAllUsers() {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE approved = 1 ORDER BY name',
    args: [],
  });
  return result.rows;
}

async function getPendingRequests() {
  const timeOff = await db.execute({
    sql: `SELECT tor.*, u.name as user_name 
          FROM time_off_requests tor 
          JOIN users u ON tor.user_id = u.id 
          WHERE tor.status = 'pending' 
          ORDER BY tor.created_at DESC`,
    args: [],
  });

  const swaps = await db.execute({
    sql: `SELECT sr.*, 
            r.name as requester_name, 
            t.name as target_name 
          FROM swap_requests sr 
          JOIN users r ON sr.requester_id = r.id 
          JOIN users t ON sr.target_id = t.id 
          WHERE sr.status = 'pending_admin' 
          ORDER BY sr.created_at DESC`,
    args: [],
  });

  const supervisorChanges = await db.execute({
    sql: `SELECT sc.*, u.name as supervisor_name 
          FROM supervisor_changes sc 
          JOIN users u ON sc.supervisor_id = u.id 
          WHERE sc.status = 'pending' 
          ORDER BY sc.created_at DESC`,
    args: [],
  });

  return {
    timeOff: timeOff.rows,
    swaps: swaps.rows,
    supervisorChanges: supervisorChanges.rows,
  };
}

async function getAnnouncements() {
  const result = await db.execute({
    sql: 'SELECT * FROM announcements ORDER BY created_at DESC',
    args: [],
  });
  return result.rows;
}

export default async function AdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/');
  }

  const [pendingUsers, allUsers, pendingRequests, announcements] = await Promise.all([
    getPendingUsers(),
    getAllUsers(),
    getPendingRequests(),
    getAnnouncements(),
  ]);

  return (
    <div className="page">
      <Header user={session.user} />
      
      <main className="main">
        <div className="container">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Admin Dashboard
          </h1>

          <AdminTabs 
            pendingUsers={pendingUsers}
            allUsers={allUsers}
            pendingRequests={pendingRequests}
            announcements={announcements}
          />
        </div>
      </main>
    </div>
  );
}
