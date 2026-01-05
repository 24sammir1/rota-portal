'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
  },
  brand: {
    color: '#e94560',
    fontSize: '2rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  tagline: {
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  card: {
    background: '#16213e',
    borderRadius: '12px',
    padding: '2rem',
    border: '1px solid #0f3460',
  },
  title: {
    color: '#ffffff',
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    fontWeight: 600,
    textAlign: 'center',
  },
  label: {
    display: 'block',
    color: '#a0a0a0',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    background: '#0f3460',
    border: '1px solid #1a3a5c',
    borderRadius: '6px',
    padding: '0.875rem 1rem',
    color: '#ffffff',
    fontSize: '1rem',
    marginBottom: '1rem',
    outline: 'none',
  },
  btn: {
    width: '100%',
    background: '#e94560',
    color: 'white',
    border: 'none',
    padding: '0.875rem',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    background: 'rgba(233, 69, 96, 0.15)',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    color: '#e94560',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#a0a0a0',
    fontSize: '0.9rem',
  },
  link: {
    color: '#e94560',
    textDecoration: 'none',
    fontWeight: 500,
  },
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid username or password');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.brand}>Rota Portal</h1>
        <p style={styles.tagline}>Staff Scheduling System</p>
        
        <div style={styles.card}>
          <h2 style={styles.title}>Sign In</h2>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter your username"
              required
            />
            
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              style={{...styles.btn, ...(loading ? styles.btnDisabled : {})}}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div style={styles.footer}>
            Don't have an account? <Link href="/register" style={styles.link}>Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
