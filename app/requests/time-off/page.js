'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { useSession } from 'next-auth/react';

export default function TimeOffRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!session) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // If no end date, use start date
    const endDate = formData.endDate || formData.startDate;

    try {
      const res = await fetch('/api/requests/time-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: endDate,
          reason: formData.reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit request');
      } else {
        router.push('/requests?submitted=timeoff');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Header user={session.user} />
      
      <main className="main">
        <div className="container" style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Request Time Off
          </h1>

          <div className="card">
            <div className="card-body">
              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-input"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date (optional, leave blank for single day)</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-input"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason (optional)</label>
                  <textarea
                    name="reason"
                    className="form-input"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g., Holiday, Doctor's appointment, etc."
                    rows={3}
                  />
                </div>

                <div className="flex gap-1">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
