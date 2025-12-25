import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db, { initDb } from '@/lib/db';
import Header from '../components/Header';
import ProfileForm from './ProfileForm';

async function getUserProfile(userId) {
  await initDb();
  
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [userId],
  });
  
  return result.rows[0];
}

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const profile = await getUserProfile(session.user.id);

  return (
    <div className="page">
      <Header user={session.user} />
      
      <main className="main">
        <div className="container" style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            My Profile
          </h1>

          <ProfileForm profile={profile} />
        </div>
      </main>
    </div>
  );
}
