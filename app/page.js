'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
    letterSpacing: '-0.5px',
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
    transition: 'color 0.2s',
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
    transition: 'background 0.2s',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  welcome: {
    color: '#ffffff',
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
    fontWeight: 600,
  },
  subtitle: {
    color: '#a0a0a0',
    marginBottom: '2rem',
    fontSize: '1rem',
  },
  card: {
    background: '#16213e',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #0f3460',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: '1.15rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: 600,
  },
  cardTitleBar: {
    width: '4px',
    height: '24px',
    background: '#e94560',
    borderRadius: '2px',
  },
  statsRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  stat: {
    background: '#0f3460',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: '0.8rem',
    marginBottom: '0.25rem',
  },
  statValue: {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  statValueAccent: {
    color: '#4ecdc4',
    fontWeight: 700,
    fontSize: '1.1rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    background: '#0f3460',
    color: '#e94560',
    padding: '0.875rem 0.75rem',
    textAlign: 'left',
    fontWeight: 500,
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '0.875rem 0.75rem',
    color: '#d0d0d0',
    borderBottom: '1px solid #0f3460',
  },
  rowHighlight: {
    background: 'rgba(233, 69, 96, 0.08)',
  },
  hoursCell: {
    color: '#4ecdc4',
    fontWeight: 600,
  },
  emptyState: {
    background: '#16213e',
    padding: '3rem',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #0f3460',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#a0a0a0',
  },
  loading: {
    padding: '3rem',
    textAlign: 'center',
    color: '#a0a0a0',
  },
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rota, setRota] = useState(null);
  const [myShifts, setMyShifts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchCurrentRota();
    }
  }, [session]);

  const fetchCurrentRota = async () => {
    try {
      const res = await fetch('/api/rota');
      const data = await res.json();
      
      if (data.rota) {
        setRota(data.rota);
        
        const userName = session.user.name.toLowerCase();
        const staffData = data.rota.staff_data;
        
        if (Array.isArray(staffData)) {
          const myData = staffData.find(s => 
            s.name.toLowerCase() === userName ||
            s.name.toLowerCase().includes(userName) ||
            userName.includes(s.name.toLowerCase())
          );
          setMyShifts(myData);
        }
      }
    } catch (err) {
      setError('Failed to load rota');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navLinks}>
          <Link href="/" style={styles.navBrand}>Rota Portal</Link>
          <Link href="/" style={{...styles.navLink, ...styles.navLinkActive}}>Dashboard</Link>
          <Link href="/time-off" style={styles.navLink}>Time Off</Link>
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
        <h1 style={styles.welcome}>Welcome, {session.user.name}</h1>
        
        {rota && (
          <p style={styles.subtitle}>
            Week ending: {new Date(rota.week_ending).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        {error && (
          <div style={{...styles.card, borderColor: '#e94560', marginBottom: '1.5rem'}}>
            <p style={{color: '#e94560'}}>{error}</p>
          </div>
        )}

        {!rota ? (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>No Rota Available</h2>
            <p style={styles.emptyText}>The rota for this week hasn't been uploaded yet.</p>
          </div>
        ) : myShifts ? (
          <>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                <span style={styles.cardTitleBar}></span>
                My Shifts This Week
              </h2>
              
              <div style={styles.statsRow}>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Role</div>
                  <div style={styles.statValue}>{myShifts.role}</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statLabel}>Total Hours</div>
                  <div style={styles.statValueAccent}>{myShifts.totalHours}</div>
                </div>
              </div>
              
              <div style={{overflowX: 'auto'}}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Day</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Time In</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Time Out</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Hours</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Day Role</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Eve Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, index) => {
                      const shift = myShifts.shifts[day];
                      const hasShift = shift && shift.timeIn;
                      return (
                        <tr key={day} style={hasShift ? styles.rowHighlight : {}}>
                          <td style={{...styles.td, fontWeight: 600}}>{dayLabels[index]}</td>
                          <td style={{...styles.td, textAlign: 'center'}}>{shift?.timeIn || '-'}</td>
                          <td style={{...styles.td, textAlign: 'center'}}>{shift?.timeOut || '-'}</td>
                          <td style={{...styles.td, textAlign: 'center', ...(shift?.hours > 0 ? styles.hoursCell : {})}}>
                            {shift?.hours > 0 ? shift.hours : '-'}
                          </td>
                          <td style={{...styles.td, textAlign: 'center'}}>{shift?.dayRole || '-'}</td>
                          <td style={{...styles.td, textAlign: 'center'}}>{shift?.eveRole || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {session.user.role === 'admin' && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>
                  <span style={styles.cardTitleBar}></span>
                  Full Team Rota
                </h2>
                <div style={{overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={{...styles.th, textAlign: 'center'}}>Role</th>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                          <th key={d} style={{...styles.th, textAlign: 'center'}}>{d}</th>
                        ))}
                        <th style={{...styles.th, textAlign: 'center'}}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rota.staff_data.map((staff, idx) => (
                        <tr key={idx} style={idx % 2 === 0 ? {} : {background: 'rgba(15, 52, 96, 0.3)'}}>
                          <td style={{...styles.td, fontWeight: 500}}>{staff.name}</td>
                          <td style={{...styles.td, textAlign: 'center', color: '#a0a0a0', fontSize: '0.85rem'}}>{staff.role}</td>
                          {days.map(day => {
                            const shift = staff.shifts[day];
                            return (
                              <td key={day} style={{...styles.td, textAlign: 'center', fontSize: '0.85rem'}}>
                                {shift?.timeIn ? `${shift.timeIn}-${shift.timeOut}` : '-'}
                              </td>
                            );
                          })}
                          <td style={{...styles.td, textAlign: 'center', ...styles.hoursCell}}>{staff.totalHours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>No Shifts Found</h2>
            <p style={styles.emptyText}>Your name wasn't found in this week's rota.</p>
            <p style={{...styles.emptyText, marginTop: '0.5rem', fontSize: '0.9rem'}}>
              Contact your manager if you think this is an error.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
