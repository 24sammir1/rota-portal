'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [rotas, setRotas] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);

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
    }
  }, [session]);

  const fetchRotas = async () => {
    try {
      const res = await fetch('/api/rota/upload');
      const data = await res.json();
      if (data.rotas) {
        setRotas(data.rotas);
      }
    } catch (error) {
      console.error('Error fetching rotas:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/users/pending');
      const data = await res.json();
      if (data.users) {
        setPendingUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
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

      const data = await res.json();

      if (res.ok) {
        setUploadStatus({ type: 'success', message: data.message });
        setSelectedFile(null);
        setPreviewData(null);
        fetchRotas();
        document.getElementById('fileInput').value = '';
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Network error: ' + error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const res = await fetch('/api/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        fetchPendingUsers();
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const res = await fetch('/api/users/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        fetchPendingUsers();
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <nav style={{ 
        background: '#333', 
        padding: '1rem', 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Rota Portal
          </Link>
          <Link href="/" style={{ color: '#ccc', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <Link href="/admin" style={{ color: 'white', textDecoration: 'none' }}>
            Admin
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#ccc' }}>{session.user.name}</span>
          <button 
            onClick={() => signOut()}
            style={{ 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 style={{ color: '#333' }}>Admin Panel</h1>

        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid #dee2e6' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'upload' ? '#0d6efd' : 'transparent',
              color: activeTab === 'upload' ? 'white' : '#333',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: activeTab === 'upload' ? 'bold' : 'normal',
            }}
          >
            Upload Rota
          </button>
          <button
            onClick={() => setActiveTab('rotas')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'rotas' ? '#0d6efd' : 'transparent',
              color: activeTab === 'rotas' ? 'white' : '#333',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: activeTab === 'rotas' ? 'bold' : 'normal',
            }}
          >
            Uploaded Rotas ({rotas.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === 'users' ? '#0d6efd' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#333',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: activeTab === 'users' ? 'bold' : 'normal',
            }}
          >
            Pending Users ({pendingUsers.length})
          </button>
        </div>

        {activeTab === 'upload' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#333', marginTop: 0 }}>Upload Rota JSON</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Export your rota from Excel using the VBA macro, then upload the JSON file here.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <input
                type="file"
                id="fileInput"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'block', marginBottom: '1rem' }}
              />
            </div>

            {previewData && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '4px',
                marginBottom: '1rem' 
              }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Preview</h3>
                <p style={{ color: '#333' }}><strong>Week Ending:</strong> {previewData.weekEnding}</p>
                <p style={{ color: '#333' }}><strong>Sheet Name:</strong> {previewData.sheetName}</p>
                <p style={{ color: '#333' }}><strong>Type:</strong> {previewData.type}</p>
                <p style={{ color: '#333' }}><strong>Staff Count:</strong> {previewData.staff?.length || 0}</p>
                
                {previewData.staff && previewData.staff.length > 0 && (
                  <details>
                    <summary style={{ cursor: 'pointer', marginTop: '0.5rem', color: '#333' }}>
                      View Staff List
                    </summary>
                    <ul style={{ maxHeight: '200px', overflow: 'auto', marginTop: '0.5rem', color: '#333' }}>
                      {previewData.staff.map((s, i) => (
                        <li key={i}>
                          {s.name} ({s.role}) - {s.totalHours} hrs
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {uploadStatus && (
              <div style={{
                padding: '1rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                background: uploadStatus.type === 'success' ? '#d4edda' : '#f8d7da',
                color: uploadStatus.type === 'success' ? '#155724' : '#721c24',
              }}>
                {uploadStatus.message}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!previewData || isUploading}
              style={{ 
                padding: '0.75rem 2rem',
                background: '#0d6efd',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (!previewData || isUploading) ? 'not-allowed' : 'pointer',
                opacity: (!previewData || isUploading) ? 0.5 : 1,
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload Rota'}
            </button>
          </div>
        )}

        {activeTab === 'rotas' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#333', marginTop: 0 }}>Uploaded Rotas</h2>
            {rotas.length === 0 ? (
              <p style={{ color: '#666' }}>No rotas uploaded yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#333' }}>Week Ending</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#333' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#333' }}>Staff</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#333' }}>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {rotas.map((rota) => (
                    <tr key={rota.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '0.75rem', color: '#333' }}>
                        {new Date(rota.week_ending).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          background: rota.type === 'actual' ? '#d4edda' : '#cce5ff',
                          color: rota.type === 'actual' ? '#155724' : '#004085',
                          fontSize: '0.85rem',
                        }}>
                          {rota.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#333' }}>{rota.staff_count}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                        {new Date(rota.uploaded_at).toLocaleString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#333', marginTop: 0 }}>Pending User Approvals</h2>
            {pendingUsers.length === 0 ? (
              <p style={{ color: '#666' }}>No pending user requests.</p>
            ) : (
              <div>
                {pendingUsers.map((user) => (
                  <div 
                    key={user.id} 
                    style={{ 
                      padding: '1rem',
                      borderBottom: '1px solid #dee2e6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#333' }}>{user.name}</strong>
                      <br />
                      <small style={{ color: '#666' }}>@{user.username}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
