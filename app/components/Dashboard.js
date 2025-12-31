'use client';

import { useState, useEffect } from 'react';

export default function Dashboard({ user }) {
  const [rota, setRota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRota();
  }, []);

  const fetchRota = async () => {
    try {
      const res = await fetch('/api/rota');
      const data = await res.json();
      
      if (res.ok) {
        setRota(data.rota || []);
      } else {
        setError(data.error || 'Failed to load rota');
      }
    } catch (err) {
      setError('Failed to load rota data');
    } finally {
      setLoading(false);
    }
  };

  const canSeeHours = user.role === 'supervisor' || user.role === 'admin';

  if (loading) {
    return (
      <div className="container">
        <div className="card text-center">
          <p>Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card mb-2">
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome, {user.name}! 👋</h2>
        <p className="text-muted">
          {user.role === 'staff' && 'View your upcoming shifts below.'}
          {user.role === 'supervisor' && 'View schedules and hours for your team.'}
          {user.role === 'admin' && 'Full access to all portal features.'}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {rota.length === 0 ? (
        <div className="card text-center">
          <h3>No Rota Uploaded Yet</h3>
          <p className="text-muted mt-1">
            {user.role === 'admin' 
              ? 'Go to Admin to upload this week\'s rota.'
              : 'Check back later - the rota hasn\'t been uploaded yet.'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {rota.map((week, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <h3 className="card-title">Week Ending: {week.week_ending}</h3>
              </div>
              <RotaDisplay 
                data={JSON.parse(week.data)} 
                userName={user.name}
                showHours={canSeeHours}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RotaDisplay({ data, userName, showHours }) {
  // Find user's shifts in the data
  const userShifts = data.shifts?.filter(
    s => s.name?.toLowerCase() === userName?.toLowerCase()
  ) || [];

  const allShifts = data.shifts || [];

  if (userShifts.length === 0 && !showHours) {
    return (
      <div className="text-center text-muted">
        <p>No shifts found for your name ({userName}).</p>
        <p className="mt-1" style={{ fontSize: '0.9rem' }}>
          Make sure your registered name matches your name on the rota.
        </p>
      </div>
    );
  }

  // If supervisor/admin, show all shifts
  const shiftsToShow = showHours ? allShifts : userShifts;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Day</th>
            <th>Time In</th>
            <th>Time Out</th>
            {showHours && <th>Hours</th>}
          </tr>
        </thead>
        <tbody>
          {shiftsToShow.length > 0 ? (
            shiftsToShow.map((shift, i) => (
              <tr key={i}>
                <td>{shift.name}</td>
                <td>{shift.day}</td>
                <td>{shift.timeIn || '-'}</td>
                <td>{shift.timeOut || '-'}</td>
                {showHours && <td>{shift.hours || '-'}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showHours ? 5 : 4} className="text-center text-muted">
                No shift data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
