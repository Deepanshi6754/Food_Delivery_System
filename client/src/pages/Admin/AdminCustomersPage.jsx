import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  Users,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/customers', {
        params: { search, status, page, limit: 10 }
      });
      if (res.data.success) {
        setCustomers(res.data.data.customers || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 10 });
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleToggleSuspension = async () => {
    if (!selectedCustomer) return;
    setModalLoading(true);
    try {
      const targetState = !selectedCustomer.isSuspended;
      await adminApi.patch(`/customers/${selectedCustomer._id}/suspend`, {
        isSuspended: targetState,
        reason: suspensionReason
      });
      setSelectedCustomer(null);
      setSuspensionReason('');
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update customer status.');
    } finally {
      setModalLoading(false);
    }
  };

  const formatPrice = (paise) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers Directory</h1>
          <p className="admin-page-subtitle">
            Manage registered platform users, order volumes, lifetime value, and account access
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearchSubmit} className="admin-toolbar-left">
          <div className="admin-search-input">
            <Search size={16} color="#78716C" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Orders</th>
              <th>Lifetime Spend</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  Loading customer database...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  No customer records matched your query.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={c.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{c.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#78716C' }}>
                          ID: {c._id.substring(c._id.length - 6)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'block', fontSize: '0.85rem' }}>{c.email}</span>
                    <span style={{ fontSize: '0.75rem', color: '#78716C' }}>{c.phone || 'N/A'}</span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-info">{c.orderCount || 0} orders</span>
                  </td>
                  <td>
                    <strong>{formatPrice(c.totalSpent)}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        c.isSuspended ? 'admin-badge-danger' : 'admin-badge-success'
                      }`}
                    >
                      {c.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Link
                        to={`/admin/customers/${c._id}`}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="View Customer Profile"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        className={`admin-btn admin-btn-sm ${
                          c.isSuspended ? 'admin-btn-secondary' : 'admin-btn-danger'
                        }`}
                        title={c.isSuspended ? 'Reactivate Customer' : 'Suspend Customer'}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setSuspensionReason(c.suspensionReason || '');
                        }}
                      >
                        {c.isSuspended ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="admin-pagination">
          <span>
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total customers)
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

      {/* Suspension / Reactivation Modal */}
      {selectedCustomer && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {selectedCustomer.isSuspended ? 'Reactivate Customer' : 'Suspend Customer Account'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSelectedCustomer(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <AlertTriangle size={24} color={selectedCustomer.isSuspended ? '#15803D' : '#DC2626'} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  Are you sure you want to{' '}
                  <strong>{selectedCustomer.isSuspended ? 'reactivate' : 'suspend'}</strong>{' '}
                  <strong>{selectedCustomer.name}</strong> ({selectedCustomer.email})?
                </p>
              </div>

              {!selectedCustomer.isSuspended && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Suspension Reason (Logged to Audit Trail)</label>
                  <textarea
                    rows="3"
                    className="admin-form-control"
                    placeholder="e.g. Chargeback abuse, fraudulent activity, abusive behavior..."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedCustomer(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${selectedCustomer.isSuspended ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                disabled={modalLoading}
                onClick={handleToggleSuspension}
              >
                {modalLoading
                  ? 'Processing...'
                  : selectedCustomer.isSuspended
                  ? 'Reactivate Account'
                  : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
