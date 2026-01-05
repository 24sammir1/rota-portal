'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const styles = {
  nav: {
    background: '#16213e',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #0f3460',
  },
  navBrand: {
    color: '#e94560',
    fontWeight: 700,
    fontSize: '1.35rem',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  navLink: {
    color: '#a0a0a0',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  navLinkActive: {
    color: '#ffffff',
  },
  navRight: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  userName: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
  },
  signOutBtn: {
    background: '#e94560',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
    fontWeight: 600,
  },
  subtitle: {
    color: '#a0a0a0',
    marginBottom: '1.5rem',
  },
  card: {
    background: '#16213e',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #0f3460',
  },
  iframe: {
    display: 'block',
    width: '100%',
    height: '800px',
    border: 'none',
  },
};

export default function TimeOffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div style={{padding: '3rem', textAlign: 'center', color: '#a0a0a0'}}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navLinks}>
          <Link href="/" style={styles.navBrand}>Rota Portal</Link>
          <Link href="/" style={styles.navLink}>Dashboard</Link>
          <Link href="/time-off" style={{...styles.navLink, ...styles.navLinkActive}}>Time Off</Link>
          {session.user.role === 'admin' && (
            <Link href="/admin" style={styles.navLink}>Admin</Link>
          )}
        </div>
        <div style={styles.navRight}>
          <span style={styles.userName}>{session.user.name}</span>
          <button onClick={() => signOut()} style={styles.signOutBtn}>Sign Out</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Request Time Off</h1>
        <p style={styles.subtitle}>
          Fill out the form below to submit a time off request. Your manager will review and respond.
        </p>

        <div style={styles.card}>
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdRYPTnfki3qW22T80ldfxzyiY4Wkz0GfZENMkfodM5N4uF6g/viewform?embedded=true"
            style={styles.iframe}
          >
            Loading form...
          </iframe>
        </div>
      </div>
    </>
  );
}
