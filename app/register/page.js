'use client';

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
    marginBottom: '0.5rem',
    fontWeight: 600,
    textAlign: 'center',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
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
  hint: {
    color: '#a0a0a0',
    fontSize: '0.8rem',
    marginTop: '-0.75rem',
    marginBottom: '1rem',
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
  success: {
    background: 'rgba(78, 205, 196, 0.15)',
    border: '1px solid rgba(78, 205, 196, 0.3)',
    color: '#4ecdc4',
    padding: '1rem',
    borderRadius: '6px',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.brand}>Rota Portal</h1>
          <p style={styles.tagline}>Staff Scheduling System</p>
          
          <div style={styles.card}>
            <div style={styles.success}>
              <div style={styles.successTitle}>Registration Submitted!</div>
              <p>Your account is pending approval. You'll be able to log in once a manager approves your registration.</p>
            </div>
            <div style={{...styles.footer, marginTop: '1.5rem'}}>
              <Link href="/login" style={styles.link}>Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.brand}>Rota Portal</h1>
        <p style={styles.tagline}>Staff Scheduling System</p>
        
        <div style={styles.card}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Use your exact name as it appears on the rota</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g. Sam, Jagga, MAMY"
              required
            />
            <p style={styles.hint}>Must match your name on the rota exactly</p>
            
            <label style={styles.label}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="Choose a username"
              required
            />
            
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="Your phone number"
            />
            
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Choose a password"
              required
            />
            
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="Confirm your password"
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              style={{...styles.btn, ...(loading ? styles.btnDisabled : {})}}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          <div style={styles.footer}>
            Already have an account? <Link href="/login" style={styles.link}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
