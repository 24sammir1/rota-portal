'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const styles = {
  nav: {
    background: '#16213e',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #0f3460',
  },
  navBrand: {
    color: '#e94560',
    fontWeight: 700,
    fontSize: '1.35rem',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  navLink: {
    color: '#a0a0a0',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  navLinkActive: {
    color: '#ffffff',
  },
  navRight: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  userName: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
  },
  signOutBtn: {
    background: '#e94560',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: '1.75rem',
    marginBottom: '1.5rem',
    fontWeight: 600,
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #0f3460',
    paddingBottom: '0',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.75rem 1.25rem',
    border: 'none',
    background: 'transparent',
    color: '#a0a0a0',
    cursor: 'pointer',
    fontSize: '0.95rem',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#ffffff',
    borderBottom: '2px solid #e94560',
  },
  badge: {
    background: '#e94560',
    color: 'white',
    borderRadius: '10px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.75rem',
    marginLeft: '0.5rem',
  },
  card: {
    background: '#16213e',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #0f3460',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: '1.15rem',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: 600,
  },
  cardTitleBar: {
    width: '4px',
    height: '24px',
    background: '#e94560',
    borderRadius: '2px',
  },
  cardDesc: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
    marginBottom: '1.25rem',
  },
  input: {
    background: '#0f3460',
    border: '1px solid #1a3a5c',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    width: '100%',
    marginBottom: '1rem',
  },
  btn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  btnPrimary: {
    background: '#e94560',
    color: 'white',
  },
  btnSuccess: {
    background: '#4ecdc4',
    color: '#1a1a2e',
  },
  btnWarning: {
    background: '#ffd93d',
    color: '#1a1a2e',
  },
  btnDanger: {
    background: '#e94560',
    color: 'white',
  },
  btnSecondary: {
    background: '#0f3460',
    color: '#a0a0a0',
  },
  btnSmall: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.85rem',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    background: '#0f3460',
    color: '#e94560',
    padding: '0.875rem 0.75rem',
    textAlign: 'left',
    fontWeight: 500,
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '0.875rem 0.75rem',
    color: '#d0d0d0',
    borderBottom: '1px solid #0f3460',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  statusApproved: {
    background: 'rgba(78, 205, 196, 0.2)',
    color: '#4ecdc4',
  },
  statusDeactivated: {
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
  },
  statusPending: {
    background: 'rgba(255, 217, 61, 0.2)',
    color: '#ffd93d',
  },
  roleBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  roleAdmin: {
    background: 'rgba(167, 139, 250, 0.2)',
    color: '#a78bfa',
  },
  roleStaff: {
    background: 'rgba(96, 165, 250, 0.2)',
    color: '#60a5fa',
  },
  preview: {
    background: '#0f3460',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: '1rem',
    marginBottom: '0.75rem',
    fontWeight: 600,
  },
  previewItem: {
    color: '#d0d0d0',
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
  },
  previewLabel: {
    color: '#a0a0a0',
  },
  alert: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  alertSuccess: {
    background: 'rgba(78, 205, 196, 0.15)',
    border: '1px solid rgba(78, 205, 196, 0.3)',
    color: '#4ecdc4',
  },
  alertError: {
    background: 'rgba(233, 69, 96, 0.15)',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    color: '#e94560',
  },
  userRow: {
    padding: '1rem',
    borderBottom: '1px solid #0f3460',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  userInfo: {
    flex: 1,
  },
  userName2: {
    color: '#ffffff',
    fontWeight: 500,
    marginBottom: '0.25rem',
  },
  userUsername: {
    color: '#a0a0a0',
    fontSize: '0.85rem',
  },
  userActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  emptyState: {
    color: '#a0a0a0',
    textAlign: 'center',
    padding: '2rem',
  },
  editInput: {
    background: '#0f3460',
    border: '1px solid #e94560',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    width: '200px',
  },
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rotas, setRotas] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Separate edit state for pending vs all users to avoid clashes
  const [editingPendingUser, setEditingPendingUser] = useState(null);
  const [pendingEditName, setPendingEditName] = useState('');

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchRotas();
      fetchPendingUsers();
      fetchAllUsers();
    }
  }, [session]);

  const fetchRotas = async () => {
    try {
      const res = await fetch('/api/rota/upload', { cache: 'no-store' });
      const data = await res.json();
      if (data.rotas) setRotas([...data.rotas]);
    } catch (error) {
      console.error('Error fetching rotas:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch(`/api/users/pending?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.users) setPendingUsers([...data.users]);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users/all', { cache: 'no-store' });
      const data = await res.json();
      if (data.users) setAllUsers([...data.users]);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadStatus(null);
    setPreviewData(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setPreviewData(json);
      } catch (error) {
        setUploadStatus({ type: 'error', message: 'Invalid JSON file' });
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!previewData) return;
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const res = await fetch('/api/rota/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setUploadStatus({ type: 'success', message: data.message || 'Uploaded' });
        setSelectedFile(null);
        setPreviewData(null);
        await fetchRotas();
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network error: ' + error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRota = async (rotaId) => {
    if (!confirm('Delete this rota? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/rota/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rotaId }),
      });
      if (res.ok) {
        await fetchRotas();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || `Delete failed (status ${res.status})`);
      }
    } catch (error) {
      console.error('Error deleting rota:', error);
      alert('Network error deleting rota: ' + error.message);
    }
  };

  const handleApproveUser = async (userId, newName = null) => {
    // Optimistic UI: remove immediately
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));

    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: newName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        await fetchPendingUsers(); // rollback
        alert(data.error || `Approve failed (status ${res.status})`);
        return;
      }

      await fetchAllUsers();
      setEditingPendingUser(null);
      setPendingEditName('');
    } catch (error) {
      await fetchPendingUsers(); // rollback
      console.error('Error approving user:', error);
      alert('Network error approving user: ' + error.message);
    }
  };

  const handleRejectUser = async (userId) => {
    if (!confirm('Reject this user? They will be deleted.')) return;

    // Optimistic UI: remove immediately
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));

    try {
      const res = await fetch('/api/users/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        await fetchPendingUsers(); // rollback
        alert(data.error || `Reject failed (status ${res.status})`);
      } else {
        await fetchPendingUsers(); // force refresh to confirm deletion
      }
    } catch (error) {
      await fetchPendingUsers(); // rollback
      console.error('Error rejecting user:', error);
      alert('Network error rejecting user: ' + error.message);
    }
  };

  const handleUpdateUser = async (userId) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: editName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || `Update failed (status ${res.status})`);
        return;
      }

      await fetchAllUsers();
      setEditingUser(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Network error updating user: ' + error.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus === 'approved' ? 'deactivate' : 'reactivate';
    const confirmMsg =
      action === 'deactivate'
        ? 'Deactivate this user? They will not be able to log in.'
        : 'Reactivate this user?';

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/users/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || `Status change failed (status ${res.status})`);
        return;
      }

      await fetchAllUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Network error changing status: ' + error.message);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#a0a0a0' }}>
        Loading...
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navLinks}>
          <Link href="/" style={styles.navBrand}>
            Rota Portal
          </Link>
          <Link href="/" style={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/time-off" style={styles.navLink}>
            Time Off
          </Link>
          <Link href="/admin" style={{ ...styles.navLink, ...styles.navLinkActive }}>
            Admin
          </Link>
        </div>
        <div style={styles.navRight}>
          <span style={styles.userName}>{session.user.name}</span>
          <button type="button" onClick={() => signOut()} style={styles.signOutBtn}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Admin Panel</h1>

        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{ ...styles.tab, ...(activeTab === 'upload' ? styles.tabActive : {}) }}
          >
            Upload Rota
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rotas')}
            style={{ ...styles.tab, ...(activeTab === 'rotas' ? styles.tabActive : {}) }}
          >
            Rotas ({rotas.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            style={{ ...styles.tab, ...(activeTab === 'pending' ? styles.tabActive : {}) }}
          >
            Pending
            {pendingUsers.length > 0 && <span style={styles.badge}>{pendingUsers.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{ ...styles.tab, ...(activeTab === 'users' ? styles.tabActive : {}) }}
          >
            All Users ({allUsers.length})
          </button>
        </div>

        {activeTab === 'upload' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardTitleBar}></span>
              Upload Rota JSON
            </h2>
            <p style={styles.cardDesc}>
              Export your rota from Excel using the VBA macro, then upload the JSON file here.
            </p>
            <input
              type="file"
              id="fileInput"
              accept=".json"
              onChange={handleFileSelect}
              style={styles.input}
            />
            {previewData && (
              <div style={styles.preview}>
                <h3 style={styles.previewTitle}>Preview</h3>
                <p style={styles.previewItem}>
                  <span style={styles.previewLabel}>Week Ending:</span> {previewData.weekEnding}
                </p>
                <p style={styles.previewItem}>
                  <span style={styles.previewLabel}>Sheet Name:</span> {previewData.sheetName}
                </p>
                <p style={styles.previewItem}>
                  <span style={styles.previewLabel}>Type:</span> {previewData.type}
                </p>
                <p style={styles.previewItem}>
                  <span style={styles.previewLabel}>Staff Count:</span>{' '}
                  {previewData.staff?.length || 0}
                </p>
              </div>
            )}
            {uploadStatus && (
              <div
                style={{
                  ...styles.alert,
                  ...(uploadStatus.type === 'success' ? styles.alertSuccess : styles.alertError),
                }}
              >
                {uploadStatus.message}
              </div>
            )}
            <button
              type="button"
              onClick={handleUpload}
              disabled={!previewData || isUploading}
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
                ...(!previewData || isUploading ? styles.btnDisabled : {}),
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload Rota'}
            </button>
          </div>
        )}

        {activeTab === 'rotas' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardTitleBar}></span>
              Uploaded Rotas
            </h2>
            <p style={styles.cardDesc}>
              Manage uploaded rotas. Delete old ones to keep only the current rota visible to staff.
            </p>
            {rotas.length === 0 ? (
              <p style={styles.emptyState}>No rotas uploaded yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Week Ending</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Staff</th>
                      <th style={styles.th}>Uploaded</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotas.map((rota, idx) => (
                      <tr key={rota.id}>
                        <td style={styles.td}>
                          {new Date(rota.week_ending).toLocaleDateString('en-GB')}
                          {idx === 0 && (
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...styles.statusApproved,
                                marginLeft: '0.5rem',
                              }}
                            >
                              Current
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(rota.type === 'actual'
                                ? styles.statusApproved
                                : styles.statusPending),
                            }}
                          >
                            {rota.type}
                          </span>
                        </td>
                        <td style={styles.td}>{rota.staff_count}</td>
                        <td style={{ ...styles.td, fontSize: '0.85rem', color: '#a0a0a0' }}>
                          {new Date(rota.uploaded_at).toLocaleString('en-GB')}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteRota(rota.id)}
                            style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardTitleBar}></span>
              Pending User Approvals
            </h2>
            <p style={styles.cardDesc}>
              Review and approve new registrations. Edit the name to match the Excel rota exactly.
            </p>
            {pendingUsers.length === 0 ? (
              <p style={styles.emptyState}>No pending user requests.</p>
            ) : (
              <div>
                {pendingUsers.map((user) => (
                  <div key={user.id} style={styles.userRow}>
                    {editingPendingUser?.id === user.id ? (
                      <div style={{ width: '100%' }}>
                        <label
                          style={{
                            color: '#a0a0a0',
                            fontSize: '0.85rem',
                            display: 'block',
                            marginBottom: '0.5rem',
                          }}
                        >
                          Name (must match Excel rota):
                        </label>
                        <input
                          type="text"
                          value={pendingEditName}
                          onChange={(e) => setPendingEditName(e.target.value)}
                          style={{ ...styles.editInput, width: '100%', marginBottom: '0.75rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleApproveUser(user.id, pendingEditName)}
                            style={{ ...styles.btn, ...styles.btnSuccess, ...styles.btnSmall }}
                          >
                            Approve with this name
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPendingUser(null);
                              setPendingEditName('');
                            }}
                            style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSmall }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={styles.userInfo}>
                          <div style={styles.userName2}>{user.name}</div>
                          <div style={styles.userUsername}>@{user.username}</div>
                        </div>
                        <div style={styles.userActions}>
                          <button
                            type="button"
                            onClick={() => handleApproveUser(user.id)}
                            style={{ ...styles.btn, ...styles.btnSuccess, ...styles.btnSmall }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPendingUser(user);
                              setPendingEditName(user.name);
                            }}
                            style={{ ...styles.btn, ...styles.btnWarning, ...styles.btnSmall }}
                          >
                            Edit & Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectUser(user.id)}
                            style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }}
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardTitleBar}></span>
              All Users
            </h2>
            <p style={styles.cardDesc}>Manage approved users. Edit names or deactivate access.</p>
            {allUsers.length === 0 ? (
              <p style={styles.emptyState}>No users yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id}>
                        <td style={styles.td}>
                          {editingUser?.id === user.id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              style={styles.editInput}
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td style={{ ...styles.td, color: '#a0a0a0' }}>{user.username}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.roleBadge,
                              ...(user.role === 'admin' ? styles.roleAdmin : styles.roleStaff),
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              ...(user.status === 'approved'
                                ? styles.statusApproved
                                : styles.statusDeactivated),
                            }}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          {editingUser?.id === user.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateUser(user.id)}
                                style={{ ...styles.btn, ...styles.btnSuccess, ...styles.btnSmall }}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(null);
                                  setEditName('');
                                }}
                                style={{ ...styles.btn, ...styles.btnSecondary, ...styles.btnSmall }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(user);
                                  setEditName(user.name);
                                }}
                                style={{ ...styles.btn, ...styles.btnWarning, ...styles.btnSmall }}
                              >
                                Edit
                              </button>
                              {user.role !== 'admin' && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(user.id, user.status)}
                                  style={{
                                    ...styles.btn,
                                    ...(user.status === 'approved' ? styles.btnDanger : styles.btnSuccess),
                                    ...styles.btnSmall,
                                  }}
                                >
                                  {user.status === 'approved' ? 'Deactivate' : 'Reactivate'}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
