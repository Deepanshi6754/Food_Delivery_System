import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  Star,
  Search,
  Eye,
  EyeOff,
  Flag,
  CheckCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modal
  const [modal, setModal] = useState({ open: false, review: null, targetStatus: 'hidden', reason: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/reviews', {
        params: { search, rating: ratingFilter, status: statusFilter, page, limit: 10 }
      });
      if (res.data.success) {
        setReviews(res.data.data.reviews || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 10 });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, ratingFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleModerateSubmit = async () => {
    if (!modal.review) return;
    setModalLoading(true);
    try {
      await adminApi.patch(`/reviews/${modal.review._id}/moderate`, {
        status: modal.targetStatus,
        reason: modal.reason
      });
      setModal({ open: false, review: null, targetStatus: 'hidden', reason: '' });
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate review.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Feedback & Reviews</h1>
          <p className="admin-page-subtitle">
            Audit restaurant ratings, moderate abusive or fabricated comments, and protect merchant reputation
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
              placeholder="Search in review comments..."
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
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Ratings</option>
            <option value="5">★★★★★ (5 Stars)</option>
            <option value="4">★★★★☆ (4 Stars)</option>
            <option value="3">★★★☆☆ (3 Stars)</option>
            <option value="2">★★☆☆☆ (2 Stars)</option>
            <option value="1">★☆☆☆☆ (1 Star)</option>
          </select>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Rating</th>
              <th>Feedback Comment</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                  Loading customer reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                  No customer reviews found matching criteria.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={r.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={r.user?.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <strong style={{ fontSize: '0.85rem' }}>{r.user?.name || 'Customer'}</strong>
                    </div>
                  </td>
                  <td>{r.restaurant?.name || 'Restaurant'}</td>
                  <td>
                    <div style={{ display: 'flex', color: '#F97316' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < r.rating ? '#F97316' : 'none'}
                          color={i < r.rating ? '#F97316' : '#D6D3D1'}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '320px', fontSize: '0.825rem' }}>
                    <p style={{ margin: 0, color: '#292524' }}>"{r.comment}"</p>
                    {r.moderationReason && (
                      <span style={{ fontSize: '0.7rem', color: '#DC2626', display: 'block', marginTop: '0.2rem' }}>
                        Moderation note: {r.moderationReason}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        r.status === 'visible' || !r.status
                          ? 'admin-badge-success'
                          : r.status === 'hidden'
                          ? 'admin-badge-danger'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {(r.status || 'visible').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      {r.status !== 'visible' && (
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Restore to Public"
                          onClick={() => setModal({ open: true, review: r, targetStatus: 'visible', reason: '' })}
                        >
                          <Eye size={14} color="#15803D" />
                        </button>
                      )}
                      {r.status !== 'hidden' && (
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Hide Review"
                          onClick={() => setModal({ open: true, review: r, targetStatus: 'hidden', reason: '' })}
                        >
                          <EyeOff size={14} color="#DC2626" />
                        </button>
                      )}
                      {r.status !== 'flagged' && (
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Flag Review"
                          onClick={() => setModal({ open: true, review: r, targetStatus: 'flagged', reason: '' })}
                        >
                          <Flag size={14} color="#D97706" />
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
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total reviews)
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
      {modal.open && modal.review && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Moderate Review</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setModal({ open: false, review: null, targetStatus: 'hidden', reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Set review visibility status to{' '}
                <strong style={{ textTransform: 'uppercase' }}>{modal.targetStatus}</strong>.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Reason / Notes *</label>
                <textarea
                  rows="3"
                  className="admin-form-control"
                  placeholder="e.g. Profanity, spam, unverified false accusations..."
                  value={modal.reason}
                  onChange={(e) => setModal({ ...modal, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setModal({ open: false, review: null, targetStatus: 'hidden', reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${
                  modal.targetStatus === 'visible' ? 'admin-btn-primary' : 'admin-btn-danger'
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
