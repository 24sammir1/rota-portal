import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db, { initDb } from '@/lib/db';
import Header from '../components/Header';
import Link from 'next/link';

async function getUserRequests(userId) {
  await initDb();
  
  const timeOff = await db.execute({
    sql: `SELECT * FROM time_off_requests WHERE user_id = ? ORDER BY created_at DESC`,
    args: [userId],
  });

  const swapsAsRequester = await db.execute({
    sql: `SELECT sr.*, u.name as target_name 
          FROM swap_requests sr 
          JOIN users u ON sr.target_id = u.id 
          WHERE sr.requester_id = ? 
          ORDER BY sr.created_at DESC`,
    args: [userId],
  });

  const swapsAsTarget = await db.execute({
    sql: `SELECT sr.*, u.name as requester_name 
          FROM swap_requests sr 
          JOIN users u ON sr.requester_id = u.id 
          WHERE sr.target_id = ? AND sr.status = 'pending_target'
          ORDER BY sr.created_at DESC`,
    args: [userId],
  });

  return {
    timeOff: timeOff.rows,
    swapsAsRequester: swapsAsRequester.rows,
    pendingSwapApprovals: swapsAsTarget.rows,
  };
}

export default async function RequestsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const requests = await getUserRequests(session.user.id);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'status-pending',
      pending_target: 'status-pending',
      pending_admin: 'status-pending',
      approved: 'status-approved',
      declined: 'status-declined',
      expired: 'status-declined',
    };
    return statusMap[status] || 'status-pending';
  };

  const formatStatus = (status) => {
    const labels = {
      pending: 'Pending',
      pending_target: 'Awaiting Colleague',
      pending_admin: 'Awaiting Admin',
      approved: 'Approved',
      declined: 'Declined',
      expired: 'Expired',
    };
    return labels[status] || status;
  };

  return (
    <div className="page">
      <Header user={session.user} />
      
      <main className="main">
        <div className="container">
          <div className="flex justify-between items-center mb-3">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>My Requests</h1>
            <div className="flex gap-1">
              <Link href="/requests/time-off" className="btn btn-primary">
                Request Time Off
              </Link>
              <Link href="/requests/swap" className="btn btn-secondary">
                Request Swap
              </Link>
            </div>
          </div>

          {/* Pending Swap Approvals (needs your action) */}
          {requests.pendingSwapApprovals.length > 0 && (
            <div className="card mb-3">
              <div className="card-header" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
                <h2 className="card-title">⚠️ Action Required</h2>
              </div>
              <div className="card-body">
                <p className="text-sm text-muted mb-2">
                  These colleagues want to swap shifts with you:
                </p>
                {requests.pendingSwapApprovals.map((swap) => (
                  <div key={swap.id} className="announcement">
                    <div className="announcement-title">
                      {swap.requester_name} wants to swap
                    </div>
                    <div className="announcement-content">
                      Their {swap.requester_shift_date} ({swap.requester_shift_time}) 
                      ↔ Your {swap.target_shift_date} ({swap.target_shift_time})
                    </div>
                    <div className="mt-2 flex gap-1">
                      <form action={`/api/swaps/${swap.id}/respond`} method="POST" style={{ display: 'inline' }}>
                        <input type="hidden" name="response" value="approve" />
                        <button type="submit" className="btn btn-sm btn-primary">Approve</button>
                      </form>
                      <form action={`/api/swaps/${swap.id}/respond`} method="POST" style={{ display: 'inline' }}>
                        <input type="hidden" name="response" value="decline" />
                        <button type="submit" className="btn btn-sm btn-danger">Decline</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Off Requests */}
          <div className="card mb-3">
            <div className="card-header">
              <h2 className="card-title">Time Off Requests</h2>
            </div>
            <div className="card-body">
              {requests.timeOff.length === 0 ? (
                <div className="empty-state">
                  <p className="text-muted">No time off requests yet.</p>
                </div>
              ) : (
                <table className="rota-table">
                  <thead>
                    <tr>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.timeOff.map((req) => (
                      <tr key={req.id}>
                        <td>
                          {new Date(req.start_date).toLocaleDateString('en-GB')} 
                          {req.start_date !== req.end_date && (
                            <> - {new Date(req.end_date).toLocaleDateString('en-GB')}</>
                          )}
                        </td>
                        <td>{req.reason || '—'}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(req.status)}`}>
                            {formatStatus(req.status)}
                          </span>
                        </td>
                        <td className="text-muted">
                          {new Date(req.created_at).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Swap Requests */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Shift Swap Requests</h2>
            </div>
            <div className="card-body">
              {requests.swapsAsRequester.length === 0 ? (
                <div className="empty-state">
                  <p className="text-muted">No swap requests yet.</p>
                </div>
              ) : (
                <table className="rota-table">
                  <thead>
                    <tr>
                      <th>Swap With</th>
                      <th>Your Shift</th>
                      <th>Their Shift</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.swapsAsRequester.map((swap) => (
                      <tr key={swap.id}>
                        <td>{swap.target_name}</td>
                        <td>{swap.requester_shift_date} ({swap.requester_shift_time})</td>
                        <td>{swap.target_shift_date} ({swap.target_shift_time})</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(swap.status)}`}>
                            {formatStatus(swap.status)}
                          </span>
                        </td>
                        <td className="text-muted">
                          {new Date(swap.created_at).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
