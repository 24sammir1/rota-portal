'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
        
        // Find current user's shifts by matching name
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
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
          <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
            Dashboard
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

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Welcome, {session.user.name}</h1>
        
        {rota && (
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Week ending: <strong>{new Date(rota.week_ending).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </p>
        )}

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {!rota ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>No Rota Available</h2>
            <p style={{ color: '#666' }}>The rota for this week hasn't been uploaded yet.</p>
          </div>
        ) : myShifts ? (
          <>
            {/* My Shifts Card */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
              <h2 style={{ color: '#333', marginTop: 0, marginBottom: '1rem' }}>My Shifts This Week</h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                Role: <strong style={{ color: '#333' }}>{myShifts.role}</strong> | 
                Total Hours: <strong style={{ color: '#0d6efd' }}>{myShifts.totalHours}</strong>
              </p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#333' }}>Day</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Time In</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Time Out</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Hours</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Day Role</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Eve Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, index) => {
                      const shift = myShifts.shifts[day];
                      const hasShift = shift && shift.timeIn;
                      return (
                        <tr key={day} style={{ background: hasShift ? '#e8f5e9' : 'white' }}>
                          <td style={{ padding: '0.75rem', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#333' }}>
                            {dayLabels[index]}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#333' }}>
                            {shift?.timeIn || '-'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#333' }}>
                            {shift?.timeOut || '-'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#333' }}>
                            {shift?.hours > 0 ? shift.hours : '-'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#333' }}>
                            {shift?.dayRole || '-'}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#333' }}>
                            {shift?.eveRole || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full Team Rota (if admin) */}
            {session.user.role === 'admin' && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#333', marginTop: 0, marginBottom: '1rem' }}>Full Team Rota</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#333', position: 'sticky', left: 0, background: '#f8f9fa' }}>Name</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Role</th>
                        {dayLabels.map(d => (
                          <th key={d} style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>{d}</th>
                        ))}
                        <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rota.staff_data.map((staff, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#f8f9fa' }}>
                          <td style={{ padding: '0.5rem', borderBottom: '1px solid #dee2e6', fontWeight: '500', color: '#333', position: 'sticky', left: 0, background: idx % 2 === 0 ? 'white' : '#f8f9fa' }}>
                            {staff.name}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#666', fontSize: '0.85rem' }}>
                            {staff.role}
                          </td>
                          {days.map(day => {
                            const shift = staff.shifts[day];
                            return (
                              <td key={day} style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', color: '#333', fontSize: '0.85rem' }}>
                                {shift?.timeIn ? `${shift.timeIn}-${shift.timeOut}` : '-'}
                              </td>
                            );
                          })}
                          <td style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#0d6efd' }}>
                            {staff.totalHours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h2 style={{ color: '#333' }}>No Shifts Found</h2>
            <p style={{ color: '#666' }}>Your name wasn't found in this week's rota. Contact your manager if you think this is an error.</p>
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '1rem' }}>Logged in as: {session.user.name}</p>
          </div>
        )}
      </div>
    </>
  );
}
