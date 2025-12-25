'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Header({ user }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Rota' },
    { href: '/requests', label: 'My Requests' },
    { href: '/profile', label: 'Profile' },
  ];

  if (user.role === 'supervisor' || user.role === 'admin') {
    navItems.push({ href: '/supervisor', label: 'Supervisor' });
  }

  if (user.role === 'admin') {
    navItems.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <header className="header">
      <div className="container header-content">
        <Link href="/" className="logo">
          ROTA
        </Link>

        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="user-badge">
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-sm btn-secondary"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
