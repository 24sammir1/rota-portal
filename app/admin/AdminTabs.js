'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTabs({ pendingUsers, allUsers, pendingRequests, announcements }) {
  const [activeTab, setActiveTab] = useState('requests');
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', expiryDate: '' });
  const router = useRouter();

  const totalPending = pendingRequests.timeOff.length + 
                       pendingRequests.swaps.length + 
                       pendingRequests.supervisorChanges.length;

  const tabs = [
    { id: 'requests', label: `Requests${totalPending > 0 ? ` (${totalPending})` : ''}` },
    { id: 'users', label: `Users${pendingUsers.length > 0 ? ` (${pendingUsers.length} pending)` : ''}` },
    { id: 'announcements', label: 'Announcements' },
    { id: 'upload', label: 'Upload Rota' },
  ];

  const handleUserAction = async (userId, action) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRequestAction = async (type, id, action) => {
    try {
      await fetch(`/api/admin/requests/${type}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm),
      });
      setAnnouncementForm({ title: '', content: '', expiryDate: '' });
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRotaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await fetch('/api/admin/rota', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
        router.refresh();
        alert('Rota uploaded successfully!');
      } catch (error) {
        alert('Invalid JSON file. Please use the Excel export button to generate the correct format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {/* Tab navigation */}
      <div className="week-selector mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`week-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {/* Time Off Requests */}
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Time Off Requests</h2>
            </div>
            <div className="card-body">
              {pendingRequests.timeOff.length === 0 ? (
                <p className="text-muted">No pending time off requests.</p>
              ) : (
                <table className="rota-table">
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.timeOff.map((req) => (
                      <tr key={req.id}>
                        <td className="staff-name">{req.user_name}</td>
                        <td>
                          {new Date(req.start_date).toLocaleDateString('en-GB')}
                          {req.start_date !== req.end_date && (
                            <> - {new Date(req.end_date).toLocaleDateString('en-GB')}</>
                          )}
                        </td>
                        <td>{req.reason || '—'}</td>
                        <td className="text-muted">{new Date(req.created_at).toLocaleDateString('en-GB')}</td>
                        <td>
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleRequestAction('time-off', req.id, 'approve')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRequestAction('time-off', req.id, 'decline')}
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
          </div>

          {/* Swap Requests */}
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Shift Swap Requests</h2>
            </div>
            <div className="card-body">
              {pendingRequests.swaps.length === 0 ? (
                <p className="text-muted">No pending swap requests.</p>
              ) : (
                <table className="rota-table">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Their Shift</th>
                      <th>Swap With</th>
                      <th>Their Shift</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.swaps.map((swap) => (
                      <tr key={swap.id}>
                        <td className="staff-name">{swap.requester_name}</td>
                        <td>{swap.requester_shift_date} ({swap.requester_shift_time})</td>
                        <td className="staff-name">{swap.target_name}</td>
                        <td>{swap.target_shift_date} ({swap.target_shift_time})</td>
                        <td>
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleRequestAction('swap', swap.id, 'approve')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRequestAction('swap', swap.id, 'decline')}
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
          </div>

          {/* Supervisor Changes */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Supervisor Change Requests</h2>
            </div>
            <div className="card-body">
              {pendingRequests.supervisorChanges.length === 0 ? (
                <p className="text-muted">No pending supervisor changes.</p>
              ) : (
                <table className="rota-table">
                  <thead>
                    <tr>
                      <th>Supervisor</th>
                      <th>Staff</th>
                      <th>Date</th>
                      <th>Change</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.supervisorChanges.map((change) => (
                      <tr key={change.id}>
                        <td>{change.supervisor_name}</td>
                        <td className="staff-name">{change.staff_name}</td>
                        <td>{new Date(change.change_date).toLocaleDateString('en-GB')}</td>
                        <td>
                          <span className="text-muted">{change.original_shift || '—'}</span>
                          <span style={{ margin: '0 0.5rem' }}>→</span>
                          <span>{change.new_shift || '—'}</span>
                        </td>
                        <td>{change.reason || '—'}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleRequestAction('supervisor-change', change.id, 'action')}
                          >
                            Mark Done
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {pendingUsers.length > 0 && (
            <div className="card mb-3">
              <div className="card-header" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
                <h2 className="card-title">⚠️ Pending Approvals</h2>
              </div>
              <div className="card-body">
                <table className="rota-table">
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
                        <td className="staff-name">{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.phone || '—'}</td>
                        <td className="text-muted">{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                        <td>
                          <div className="flex gap-1">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleUserAction(user.id, 'approve')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleUserAction(user.id, 'reject')}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">All Staff ({allUsers.length})</h2>
            </div>
            <div className="card-body">
              {allUsers.length === 0 ? (
                <p className="text-muted">No approved users yet.</p>
              ) : (
                <table className="rota-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="staff-name">{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.phone || '—'}</td>
                        <td>
                          <span className={`status-badge ${user.role === 'admin' ? 'status-approved' : user.role === 'supervisor' ? 'status-pending' : ''}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {user.role !== 'admin' && (
                            <div className="flex gap-1">
                              {user.role === 'staff' && (
                                <button 
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleUserAction(user.id, 'make-supervisor')}
                                >
                                  Make Supervisor
                                </button>
                              )}
                              {user.role === 'supervisor' && (
                                <button 
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleUserAction(user.id, 'remove-supervisor')}
                                >
                                  Remove Supervisor
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Post Announcement</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleAnnouncementSubmit}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-input"
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    required
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date (optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={announcementForm.expiryDate}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiryDate: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Post Announcement</button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Current Announcements</h2>
            </div>
            <div className="card-body">
              {announcements.length === 0 ? (
                <p className="text-muted">No announcements yet.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="announcement" style={{ position: 'relative' }}>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                      }}
                    >
                      ×
                    </button>
                    <div className="announcement-title">{ann.title}</div>
                    <div className="announcement-content">{ann.content}</div>
                    <div className="announcement-date">
                      Posted: {new Date(ann.created_at).toLocaleDateString('en-GB')}
                      {ann.expiry_date && ` • Expires: ${new Date(ann.expiry_date).toLocaleDateString('en-GB')}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Rota Tab */}
      {activeTab === 'upload' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <div className="card-header">
            <h2 className="card-title">Upload Rota</h2>
          </div>
          <div className="card-body">
            <p className="text-muted mb-3">
              Use the "Export for Portal" button in your Excel workbook to generate a JSON file, then upload it here.
            </p>
            
            <div className="form-group">
              <label className="form-label">Select JSON file</label>
              <input
                type="file"
                accept=".json"
                onChange={handleRotaUpload}
                className="form-input"
                style={{ padding: '0.5rem' }}
              />
            </div>

            <div style={{ 
              background: 'var(--bg-secondary)', 
              padding: '1rem', 
              borderRadius: '8px',
              marginTop: '1.5rem'
            }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Expected JSON format:</h4>
              <pre style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)',
                overflow: 'auto',
                fontFamily: 'Space Mono, monospace'
              }}>
{`{
  "weekEnding": "21/12/2025",
  "kitchen": [...],
  "drivers": [...],
  "staffRoles": [...]
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
