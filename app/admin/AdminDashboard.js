'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingUsers();
    }
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/pending');
      const data = await res.json();
      if (res.ok) {
        setPendingUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, role = 'staff') => {
    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve', role }),
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'User approved successfully' });
        fetchPendingUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to approve user' });
    }
  };

  const handleDecline = async (userId) => {
    if (!confirm('Are you sure you want to decline this user?')) return;
    
    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'decline' }),
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'User declined' });
        fetchPendingUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to decline user' });
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-1 mb-2">
        <button 
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Users {pendingUsers.length > 0 && `(${pendingUsers.length})`}
        </button>
        <button 
          className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Rota
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Pending Registrations</h2>
          </div>
          
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-muted">No pending registrations</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-1">
                        <button 
                          className="btn btn-success"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => handleApprove(user.id, 'staff')}
                        >
                          Staff
                        </button>
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => handleApprove(user.id, 'supervisor')}
                        >
                          Supervisor
                        </button>
                        <button 
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => handleDecline(user.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <RotaUpload onMessage={setMessage} />
      )}
    </div>
  );
}

function RotaUpload({ onMessage }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      onMessage({ type: 'error', text: 'Please select a JSON file' });
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch('/api/rota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekEnding: data.weekEnding || 'Unknown',
          data: data,
        }),
      });

      if (res.ok) {
        onMessage({ type: 'success', text: 'Rota uploaded successfully!' });
        setFile(null);
      } else {
        const err = await res.json();
        onMessage({ type: 'error', text: err.error || 'Upload failed' });
      }
    } catch (err) {
      onMessage({ type: 'error', text: 'Invalid JSON file' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Upload Rota</h2>
      </div>

      <p className="text-muted mb-2">
        Upload a JSON file exported from your Excel rota using the VBA export button.
      </p>

      <div className="form-group">
        <input
          type="file"
          accept=".json"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="form-input"
        />
      </div>

      <button 
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Rota'}
      </button>
    </div>
  );
}
