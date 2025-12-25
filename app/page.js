import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db, { initDb } from '@/lib/db';
import Header from './components/Header';
import RotaView from './components/RotaView';
import Announcements from './components/Announcements';
import QuickActions from './components/QuickActions';

async function getRotaData() {
  await initDb();
  
  const result = await db.execute({
    sql: 'SELECT * FROM rota_data ORDER BY uploaded_at DESC LIMIT 2',
    args: [],
  });
  
  return result.rows.map(row => ({
    ...row,
    data: JSON.parse(row.data),
  }));
}

async function getAnnouncements() {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await db.execute({
    sql: `SELECT * FROM announcements 
          WHERE expiry_date IS NULL OR expiry_date >= ? 
          ORDER BY created_at DESC`,
    args: [today],
  });
  
  return result.rows;
}

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const [rotaData, announcements] = await Promise.all([
    getRotaData(),
    getAnnouncements(),
  ]);

  return (
    <div className="page">
      <Header user={session.user} />
      
      <main className="main">
        <div className="container">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="mb-4">
              <Announcements items={announcements} />
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-4">
            <QuickActions userRole={session.user.role} />
          </div>

          {/* Rota View */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Weekly Rota</h2>
            </div>
            <div className="card-body">
              <RotaView 
                rotaData={rotaData} 
                showHours={session.user.role === 'supervisor' || session.user.role === 'admin'} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
