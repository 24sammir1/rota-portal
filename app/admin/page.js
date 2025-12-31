import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navigation from '../components/Navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <>
      <Navigation user={session.user} />
      <AdminDashboard />
    </>
  );
}
