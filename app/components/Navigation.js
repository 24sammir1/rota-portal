'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Navigation({ user }) {
  const roleBadgeClass = {
    staff: 'badge-staff',
    supervisor: 'badge-supervisor',
    admin: 'badge-admin',
  };

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        🍕 Rota Portal
      </Link>
      
      <div className="nav-links">
        <Link href="/" className="nav-link">Dashboard</Link>
        
        {user.role === 'admin' && (
          <Link href="/admin" className="nav-link">Admin</Link>
        )}
        
        <span className="text-muted">|</span>
        
        <span className="flex items-center gap-1">
          <span>{user.name}</span>
          <span className={`badge ${roleBadgeClass[user.role]}`}>
            {user.role}
          </span>
        </span>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
