import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });

  // Inspection Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/audit-logs', {
        params: {
          search,
          action: actionFilter,
          targetType: targetTypeFilter,
          adminRole: roleFilter,
          page,
          limit: 15
        }
      });
      if (res.data.success) {
        setLogs(res.data.data.logs || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 15 });
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, targetTypeFilter, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Security & Operations Audit Trail</h1>
          <p className="admin-page-subtitle">
            Immutable, non-repudiable logs of administrative actions, status overrides, and financial approvals
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#DCFCE7', color: '#15803D', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
          <Lock size={14} />
          <span>Immutable Append-Only Log</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-toolbar-left">
          <div className="admin-search-input">
            <Search size={16} color="#78716C" />
            <input
              type="text"
              placeholder="Search by admin name, target, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-secondary">
            Search
          </button>
        </form>

        <div className="admin-toolbar-right">
          <select
            className="admin-select"
            value={targetTypeFilter}
            onChange={(e) => {
              setTargetTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Target Types</option>
            <option value="Order">Orders</option>
            <option value="Restaurant">Restaurants</option>
            <option value="Rider">Riders</option>
            <option value="Customer">Customers</option>
            <option value="Refund">Refunds</option>
            <option value="Payout">Payouts</option>
            <option value="Settings">Settings</option>
            <option value="Category">Categories</option>
            <option value="MenuItem">Menu Items</option>
            <option value="Coupon">Coupons</option>
            <option value="Review">Reviews</option>
            <option value="SupportTicket">Support Tickets</option>
          </select>

          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Admin Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="operations_admin">Operations Admin</option>
            <option value="finance_admin">Finance Admin</option>
            <option value="support_admin">Support Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Administrator</th>
              <th>Role</th>
              <th>Action Executed</th>
              <th>Target Type</th>
              <th>Target Entity</th>
              <th>Reason / Justification</th>
              <th>IP Address</th>
              <th style={{ textAlign: 'right' }}>Payload</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  Loading security audit trail...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  No audit log entries matching your criteria.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l._id}>
                  <td style={{ fontSize: '0.75rem', color: '#78716C', whiteSpace: 'nowrap' }}>
                    {new Date(l.createdAt).toLocaleDateString()} {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>{l.adminName}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#78716C' }}>{l.adminEmail}</span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        l.adminRole === 'super_admin'
                          ? 'admin-badge-success'
                          : l.adminRole === 'finance_admin'
                          ? 'admin-badge-warning'
                          : 'admin-badge-info'
                      }`}
                    >
                      {l.adminRole}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#F97316' }}>
                      {l.action}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-neutral">{l.targetType}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.85rem' }}>{l.targetName || l.targetId || '-'}</strong>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#78716C', maxWidth: '240px' }}>
                    {l.reason || '-'}
                  </td>
                  <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#78716C' }}>
                    {l.ipAddress}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      title="Inspect Metadata Payload"
                      onClick={() => setSelectedLog(l)}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="admin-pagination">
          <span>
            Page {pagination.page} of {pagination.pages} ({pagination.total} audit events recorded)
          </span>
          <div className="admin-pagination-buttons">
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Metadata Payload Modal */}
      {selectedLog && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Audit Record Inspection</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedLog(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#78716C' }}>Action:</span>{' '}
                  <strong style={{ color: '#F97316' }}>{selectedLog.action}</strong>
                </div>
                <div>
                  <span style={{ color: '#78716C' }}>Target:</span>{' '}
                  <strong>{selectedLog.targetType} ({selectedLog.targetName})</strong>
                </div>
                <div>
                  <span style={{ color: '#78716C' }}>Admin:</span>{' '}
                  <strong>{selectedLog.adminName}</strong> ({selectedLog.adminRole})
                </div>
                <div>
                  <span style={{ color: '#78716C' }}>IP Address:</span>{' '}
                  <code>{selectedLog.ipAddress}</code>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#78716C' }}>Reason:</span>{' '}
                  <em>{selectedLog.reason || 'None provided'}</em>
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem', color: '#78716C' }}>
                  Payload & Diff Details (JSON):
                </strong>
                <pre
                  style={{
                    background: '#292524',
                    color: '#FFF8F0',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    maxHeight: '260px'
                  }}
                >
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
