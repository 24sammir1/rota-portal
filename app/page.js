import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <Navigation user={session.user} />
      <Dashboard user={session.user} />
    </>
  );
}
