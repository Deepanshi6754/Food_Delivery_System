import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Percent,
  Ban,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';

export default function AdminRestaurantsPage() {
  const [searchParams] = useSearchParams();
  const initialApproval = searchParams.get('approvalStatus') || 'all';

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvalStatus, setApprovalStatus] = useState(initialApproval);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modals state
  const [approvalModal, setApprovalModal] = useState({ open: false, restaurant: null, status: 'approved', reason: '' });
  const [commissionModal, setCommissionModal] = useState({ open: false, restaurant: null, rate: 15 });
  const [suspendModal, setSuspendModal] = useState({ open: false, restaurant: null, reason: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/restaurants', {
        params: { search, approvalStatus, page, limit: 10 }
      });
      if (res.data.success) {
        setRestaurants(res.data.data.restaurants || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 10 });
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [page, approvalStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants();
  };

  const handleApprovalSubmit = async () => {
    if (!approvalModal.restaurant) return;
    setModalLoading(true);
    try {
      await adminApi.patch(`/restaurants/${approvalModal.restaurant._id}/approval`, {
        status: approvalModal.status,
        reason: approvalModal.reason
      });
      setApprovalModal({ open: false, restaurant: null, status: 'approved', reason: '' });
      fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval status.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCommissionSubmit = async () => {
    if (!commissionModal.restaurant) return;
    setModalLoading(true);
    try {
      await adminApi.patch(`/restaurants/${commissionModal.restaurant._id}/commission`, {
        commissionRate: commissionModal.rate
      });
      setCommissionModal({ open: false, restaurant: null, rate: 15 });
      fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update commission rate.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSuspendSubmit = async () => {
    if (!suspendModal.restaurant) return;
    setModalLoading(true);
    try {
      const nextState = !suspendModal.restaurant.isSuspended;
      await adminApi.patch(`/restaurants/${suspendModal.restaurant._id}/suspend`, {
        isSuspended: nextState,
        reason: suspendModal.reason
      });
      setSuspendModal({ open: false, restaurant: null, reason: '' });
      fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update suspension status.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleTogglePromoted = async (r) => {
    try {
      await adminApi.patch(`/restaurants/${r._id}/promoted`, {
        isPromoted: !r.isPromoted
      });
      fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update promoted status.');
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
          <h1 className="admin-page-title">Restaurant Partners</h1>
          <p className="admin-page-subtitle">
            Manage restaurant onboarding applications, menus, customized commission rates, and operational status
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
              placeholder="Search by restaurant name, city, or email..."
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
            value={approvalStatus}
            onChange={(e) => {
              setApprovalStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Approval States</option>
            <option value="approved">Approved & Active</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Owner / Contact</th>
              <th>City</th>
              <th>Dishes</th>
              <th>Delivered Sales</th>
              <th>Commission</th>
              <th>Approval</th>
              <th>Promoted</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  Loading restaurant partners...
                </td>
              </tr>
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  No restaurants found matching your criteria.
                </td>
              </tr>
            ) : (
              restaurants.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={r.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150'}
                        alt={r.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{r.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#78716C' }}>
                          Rating: ★ {r.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'block', fontSize: '0.85rem' }}>{r.owner?.name || r.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                      {r.contact?.email || r.owner?.email || 'N/A'}
                    </span>
                  </td>
                  <td>{r.address?.city || 'Delhi'}</td>
                  <td>
                    <span className="admin-badge admin-badge-info">{r.totalDishes || 0} items</span>
                  </td>
                  <td>
                    <strong>{formatPrice(r.grossRevenue)}</strong>
                  </td>
                  <td>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      title="Edit Commission %"
                      onClick={() =>
                        setCommissionModal({
                          open: true,
                          restaurant: r,
                          rate: r.platformCommission !== undefined ? r.platformCommission : 15
                        })
                      }
                    >
                      <Percent size={12} />
                      <span>{r.platformCommission !== undefined ? r.platformCommission : 15}%</span>
                    </button>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        r.approvalStatus === 'approved'
                          ? 'admin-badge-success'
                          : r.approvalStatus === 'rejected'
                          ? 'admin-badge-danger'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {r.approvalStatus?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`admin-icon-btn ${r.isPromoted ? 'admin-badge-warning' : ''}`}
                      style={{ width: '28px', height: '28px' }}
                      title={r.isPromoted ? 'Featured on platform' : 'Click to promote'}
                      onClick={() => handleTogglePromoted(r)}
                    >
                      <Sparkles size={14} color={r.isPromoted ? '#F97316' : '#A8A29E'} />
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {r.approvalStatus === 'pending' ? (
                        <>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            title="Approve Restaurant"
                            onClick={() =>
                              setApprovalModal({ open: true, restaurant: r, status: 'approved', reason: '' })
                            }
                          >
                            <CheckCircle size={14} />
                            <span>Approve</span>
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title="Reject Restaurant"
                            onClick={() =>
                              setApprovalModal({ open: true, restaurant: r, status: 'rejected', reason: '' })
                            }
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <button
                          className={`admin-btn admin-btn-sm ${
                            r.isSuspended ? 'admin-btn-secondary' : 'admin-btn-danger'
                          }`}
                          title={r.isSuspended ? 'Reactivate' : 'Suspend'}
                          onClick={() => setSuspendModal({ open: true, restaurant: r, reason: '' })}
                        >
                          <Ban size={14} />
                          <span>{r.isSuspended ? 'Reactivate' : 'Suspend'}</span>
                        </button>
                      )}
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
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total restaurants)
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

      {/* Approval / Rejection Modal */}
      {approvalModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {approvalModal.status === 'approved' ? 'Approve Restaurant' : 'Reject Application'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setApprovalModal({ open: false, restaurant: null, status: 'approved', reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                You are about to <strong>{approvalModal.status}</strong> the onboarding application for{' '}
                <strong>{approvalModal.restaurant?.name}</strong>.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Reviewer Notes / Reason</label>
                <textarea
                  rows="3"
                  className="admin-form-control"
                  placeholder="e.g. License verified, health certificate approved..."
                  value={approvalModal.reason}
                  onChange={(e) => setApprovalModal({ ...approvalModal, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setApprovalModal({ open: false, restaurant: null, status: 'approved', reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${
                  approvalModal.status === 'approved' ? 'admin-btn-primary' : 'admin-btn-danger'
                }`}
                disabled={modalLoading}
                onClick={handleApprovalSubmit}
              >
                {modalLoading ? 'Saving...' : `Confirm ${approvalModal.status}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {commissionModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Configure Platform Commission Rate</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setCommissionModal({ open: false, restaurant: null, rate: 15 })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Set platform commission rate percentage for <strong>{commissionModal.restaurant?.name}</strong>.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Commission Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  className="admin-form-control"
                  value={commissionModal.rate}
                  onChange={(e) => setCommissionModal({ ...commissionModal, rate: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: '#78716C', display: 'block', marginTop: '0.35rem' }}>
                  Standard platform rate is 15%. This fee is automatically deducted on delivered orders.
                </span>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setCommissionModal({ open: false, restaurant: null, rate: 15 })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={modalLoading}
                onClick={handleCommissionSubmit}
              >
                {modalLoading ? 'Updating...' : 'Save Commission Rate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {suspendModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {suspendModal.restaurant?.isSuspended ? 'Reactivate Restaurant' : 'Suspend Restaurant'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSuspendModal({ open: false, restaurant: null, reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Are you sure you want to{' '}
                <strong>{suspendModal.restaurant?.isSuspended ? 'reactivate' : 'suspend'}</strong>{' '}
                <strong>{suspendModal.restaurant?.name}</strong>?
              </p>
              {!suspendModal.restaurant?.isSuspended && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Suspension Reason</label>
                  <textarea
                    rows="3"
                    className="admin-form-control"
                    placeholder="e.g. Hygiene complaint, repeated order failures, license expiry..."
                    value={suspendModal.reason}
                    onChange={(e) => setSuspendModal({ ...suspendModal, reason: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSuspendModal({ open: false, restaurant: null, reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${
                  suspendModal.restaurant?.isSuspended ? 'admin-btn-primary' : 'admin-btn-danger'
                }`}
                disabled={modalLoading}
                onClick={handleSuspendSubmit}
              >
                {modalLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
