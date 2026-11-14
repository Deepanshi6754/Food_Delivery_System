import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  UtensilsCrossed,
  Search,
  Filter,
  Flag,
  Ban,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function AdminMenuModerationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moderationStatus, setModerationStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 12 });

  // Modal
  const [modal, setModal] = useState({ open: false, item: null, targetStatus: 'flagged', reason: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/menu', {
        params: { search, moderationStatus, page, limit: 12 }
      });
      if (res.data.success) {
        setItems(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 12 });
      }
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, moderationStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleModerateSubmit = async () => {
    if (!modal.item) return;
    setModalLoading(true);
    try {
      await adminApi.patch(`/menu/${modal.item._id}/moderate`, {
        moderationStatus: modal.targetStatus,
        reason: modal.reason
      });
      setModal({ open: false, item: null, targetStatus: 'flagged', reason: '' });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate menu item.');
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
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Menu Moderation & Content Safety</h1>
          <p className="admin-page-subtitle">
            Inspect dishes across merchant menus, flag policy violations, and ban non-compliant offerings
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
              placeholder="Search dish name or description..."
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
            value={moderationStatus}
            onChange={(e) => {
              setModerationStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Moderation States</option>
            <option value="active">Active & Verified</option>
            <option value="flagged">Flagged for Review</option>
            <option value="banned">Banned from Platform</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dish</th>
              <th>Restaurant</th>
              <th>Category</th>
              <th>Price</th>
              <th>Availability</th>
              <th>Moderation Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  Loading food items across platform...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  No menu items found matching query.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={it.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'}
                        alt={it.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{it.name}</strong>
                        {it.moderationReason && (
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#DC2626' }}>
                            Note: {it.moderationReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{it.restaurant?.name || 'Restaurant'}</td>
                  <td>
                    <span className="admin-badge admin-badge-neutral">{it.category || 'General'}</span>
                  </td>
                  <td>
                    <strong>{formatPrice(it.price)}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${it.isAvailable ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                    >
                      {it.isAvailable ? 'In Stock' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        it.moderationStatus === 'active'
                          ? 'admin-badge-success'
                          : it.moderationStatus === 'banned'
                          ? 'admin-badge-danger'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {it.moderationStatus?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {it.moderationStatus !== 'active' && (
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Restore to Active"
                          onClick={() =>
                            setModal({ open: true, item: it, targetStatus: 'active', reason: '' })
                          }
                        >
                          <CheckCircle size={14} color="#15803D" />
                        </button>
                      )}
                      {it.moderationStatus !== 'flagged' && (
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Flag Dish"
                          onClick={() =>
                            setModal({ open: true, item: it, targetStatus: 'flagged', reason: '' })
                          }
                        >
                          <Flag size={14} color="#D97706" />
                        </button>
                      )}
                      {it.moderationStatus !== 'banned' && (
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          title="Ban Dish"
                          onClick={() =>
                            setModal({ open: true, item: it, targetStatus: 'banned', reason: '' })
                          }
                        >
                          <Ban size={14} />
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
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total items)
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

      {/* Moderation Reason Modal */}
      {modal.open && modal.item && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Moderate Dish: {modal.item.name}</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setModal({ open: false, item: null, targetStatus: 'flagged', reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Set moderation status to <strong style={{ textTransform: 'uppercase' }}>{modal.targetStatus}</strong>{' '}
                for dish from <strong>{modal.item.restaurant?.name}</strong>.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Moderation Reason *</label>
                <textarea
                  rows="3"
                  required
                  className="admin-form-control"
                  placeholder="e.g. Misleading photo, allergen non-disclosure, prohibited ingredient..."
                  value={modal.reason}
                  onChange={(e) => setModal({ ...modal, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setModal({ open: false, item: null, targetStatus: 'flagged', reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${
                  modal.targetStatus === 'banned'
                    ? 'admin-btn-danger'
                    : modal.targetStatus === 'active'
                    ? 'admin-btn-primary'
                    : 'admin-btn-secondary'
                }`}
                disabled={modalLoading}
                onClick={handleModerateSubmit}
              >
                {modalLoading ? 'Saving...' : `Set as ${modal.targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
