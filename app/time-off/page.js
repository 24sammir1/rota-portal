'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function TimeOffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <nav style={{ 
        background: '#333', 
        padding: '1rem', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Rota Portal
          </Link>
          <Link href="/" style={{ color: '#ccc', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link href="/time-off" style={{ color: 'white', textDecoration: 'none' }}>
            Time Off
          </Link>
          {session.user.role === 'admin' && (
            <Link href="/admin" style={{ color: '#ccc', textDecoration: 'none' }}>
              Admin
            </Link>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#ccc' }}>{session.user.name}</span>
          <button 
            onClick={() => signOut()}
            style={{ 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Request Time Off</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Fill out the form below to submit a time off request. Your manager will review and respond to your request.
        </p>

        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdRYPTnfki3qW22T80ldfxzyiY4Wkz0GfZENMkfodM5N4uF6g/viewform?embedded=true"
            width="100%"
            height="800"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            style={{ display: 'block' }}
          >
            Loading form...
          </iframe>
        </div>
      </div>
    </>
  );
}
