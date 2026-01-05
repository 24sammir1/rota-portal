'use client';

import { useState } from 'react';
import Link from 'next/link';

const styles = {
  page: { minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  container: { width: '100%', maxWidth: '450px' },
  brand: { color: '#e94560', fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' },
  tagline: { color: '#a0a0a0', textAlign: 'center', marginBottom: '2rem' },
  card: { background: '#16213e', borderRadius: '12px', padding: '2rem', border: '1px solid #0f3460' },
  title: { color: '#ffffff', fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600, textAlign: 'center' },
  label: { display: 'block', color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '0.5rem' },
  input: { width: '100%', background: '#0f3460', border: '1px solid #1a3a5c', borderRadius: '6px', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '1rem', marginBottom: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  btn: { width: '100%', background: '#e94560', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  error: { background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' },
  success: { background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.3)', color: '#4ecdc4', padding: '1rem', borderRadius: '6px', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: '#a0a0a0', fontSize: '0.9rem' },
  link: { color: '#e94560', textDecoration: 'none', fontWeight: 500 },
  checkbox: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#a0a0a0' },
  section: { color: '#e94560', fontSize: '0.85rem', marginBottom: '1rem', marginTop: '0.5rem', borderBottom: '1px solid #0f3460', paddingBottom: '0.5rem' }
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', dob: '', emergencyName: '', emergencyRelation: '', emergencyPhone: '', existingStaff: false, startDate: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setSuccess(true);
      else setError(data.error || 'Registration failed');
    } catch { setError('Network error'); }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.brand}>Rota Portal</h1>
          <div style={styles.card}>
            <div style={styles.success}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Registration Submitted!</div>
              <p>Your account is pending approval. You'll be able to log in once approved.</p>
            </div>
            <div style={styles.footer}><Link href="/login" style={styles.link}>Back to Login</Link></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.brand}>Rota Portal</h1>
        <p style={styles.tagline}>Staff Registration</p>
        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.section}>Personal Details</div>
            <label style={styles.label}>Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} style={styles.input} required />
            
            <label style={styles.label}>Date of Birth *</label>
            <input name="dob" type="date" value={form.dob} onChange={handleChange} style={styles.input} required />
            
            <label style={styles.label}>Phone Number *</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={styles.input} required />
            
            <label style={styles.label}>Home Address *</label>
            <input name="address" value={form.address} onChange={handleChange} style={styles.input} required />

            <div style={styles.section}>Emergency Contact</div>
            <label style={styles.label}>Contact Name *</label>
            <input name="emergencyName" value={form.emergencyName} onChange={handleChange} style={styles.input} required />
            
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Relationship *</label>
                <input name="emergencyRelation" value={form.emergencyRelation} onChange={handleChange} style={styles.input} required />
              </div>
              <div>
                <label style={styles.label}>Phone *</label>
                <input name="emergencyPhone" type="tel" value={form.emergencyPhone} onChange={handleChange} style={styles.input} required />
              </div>
            </div>

            <div style={styles.section}>Employment</div>
            <label style={styles.checkbox}>
              <input type="checkbox" name="existingStaff" checked={form.existingStaff} onChange={handleChange} />
              I'm an existing staff member
            </label>
            {!form.existingStaff && (
              <>
                <label style={styles.label}>Start Date *</label>
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} style={styles.input} required={!form.existingStaff} />
              </>
            )}

            <div style={styles.section}>Account Login</div>
            <label style={styles.label}>Username *</label>
            <input name="username" value={form.username} onChange={handleChange} style={styles.input} required />
            
            <label style={styles.label}>Password *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} style={styles.input} required />
            
            <label style={styles.label}>Confirm Password *</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} style={styles.input} required />

            <button type="submit" disabled={loading} style={{...styles.btn, ...(loading ? styles.btnDisabled : {})}}>{loading ? 'Submitting...' : 'Register'}</button>
          </form>
          <div style={styles.footer}>Already registered? <Link href="/login" style={styles.link}>Sign In</Link></div>
        </div>
      </div>
    </div>
  );
}
