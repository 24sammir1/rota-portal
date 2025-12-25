'use client';

import Link from 'next/link';

export default function QuickActions({ userRole }) {
  return (
    <div className="grid-3">
      <Link href="/requests/time-off" className="card" style={{ textDecoration: 'none' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗓️</div>
          <div style={{ fontWeight: 500 }}>Request Time Off</div>
          <div className="text-sm text-muted">Submit a new request</div>
        </div>
      </Link>

      <Link href="/requests/swap" className="card" style={{ textDecoration: 'none' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
          <div style={{ fontWeight: 500 }}>Request Shift Swap</div>
          <div className="text-sm text-muted">Swap with a colleague</div>
        </div>
      </Link>

      <Link href="/requests" className="card" style={{ textDecoration: 'none' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontWeight: 500 }}>My Requests</div>
          <div className="text-sm text-muted">View request status</div>
        </div>
      </Link>
    </div>
  );
}
