'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ profile }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    emergencyContact: profile.emergency_contact || '',
    availability: profile.availability || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
        router.refresh();
      } else {
        setMessage('Failed to update profile. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        {message && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            background: message.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.includes('success') ? '#22c55e' : '#ef4444',
            border: `1px solid ${message.includes('success') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={profile.username}
              disabled
              style={{ opacity: 0.6 }}
            />
            <p className="text-sm text-muted mt-1">Username cannot be changed</p>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              className="form-input"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Name and phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Weekly Availability</label>
            <textarea
              name="availability"
              className="form-input"
              value={formData.availability}
              onChange={handleChange}
              placeholder="e.g., Can't work Mondays before 6pm due to day job at Primark. Available all day Tue-Sun."
              rows={4}
            />
            <p className="text-sm text-muted mt-1">
              Describe any regular commitments that affect your availability
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
