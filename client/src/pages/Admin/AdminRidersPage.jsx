import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  Bike,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  ShieldCheck,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';

export default function AdminRidersPage() {
  const [searchParams] = useSearchParams();
  const initialVerification = searchParams.get('verificationStatus') || 'all';

  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(initialVerification);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modals
  const [kycModal, setKycModal] = useState({ open: false, rider: null });
  const [verifyModal, setVerifyModal] = useState({ open: false, rider: null, status: 'approved', reason: '' });
  const [suspendModal, setSuspendModal] = useState({ open: false, rider: null, reason: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/riders', {
        params: { search, verificationStatus, page, limit: 10 }
      });
      if (res.data.success) {
        setRiders(res.data.data.riders || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 10 });
      }
    } catch (err) {
      console.error('Failed to load delivery fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, [page, verificationStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRiders();
  };

  const handleVerificationSubmit = async () => {
    if (!verifyModal.rider) return;
    setModalLoading(true);
    try {
      await adminApi.patch(`/riders/${verifyModal.rider._id}/verification`, {
        status: verifyModal.status,
        reason: verifyModal.reason
      });
      setVerifyModal({ open: false, rider: null, status: 'approved', reason: '' });
      fetchRiders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rider verification.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSuspendSubmit = async () => {
    if (!suspendModal.rider) return;
    setModalLoading(true);
    try {
      const nextState = !suspendModal.rider.isSuspended;
      await adminApi.patch(`/riders/${suspendModal.rider._id}/suspend`, {
        isSuspended: nextState,
        reason: suspendModal.reason
      });
      setSuspendModal({ open: false, rider: null, reason: '' });
      fetchRiders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rider suspension.');
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
          <h1 className="admin-page-title">Delivery Fleet Operations</h1>
          <p className="admin-page-subtitle">
            KYC identity verification, vehicle document review, availability status, and fleet performance
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
              placeholder="Search rider name, phone, or email..."
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
            value={verificationStatus}
            onChange={(e) => {
              setVerificationStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Verification States</option>
            <option value="approved">Approved Riders</option>
            <option value="pending">Pending KYC Review</option>
            <option value="rejected">Rejected Applications</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Rider</th>
              <th>Contact</th>
              <th>City & Vehicle</th>
              <th>Deliveries</th>
              <th>Rating</th>
              <th>Wallet</th>
              <th>Availability</th>
              <th>KYC Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  Loading delivery fleet directory...
                </td>
              </tr>
            ) : riders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  No delivery riders found matching your criteria.
                </td>
              </tr>
            ) : (
              riders.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={r.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={r.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{r.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#78716C' }}>
                          ID: {r._id.substring(r._id.length - 6)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'block', fontSize: '0.85rem' }}>{r.phone || 'N/A'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#78716C' }}>{r.email}</span>
                  </td>
                  <td>
                    <strong style={{ display: 'block', fontSize: '0.85rem' }}>
                      {r.operatingCity || 'Delhi'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                      {r.vehicleDetails?.vehicleType || 'Bike'} ({r.vehicleDetails?.registrationNumber || 'Pending'})
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-info">{r.totalDeliveries || 0} completed</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.85rem' }}>★ {r.rating || '4.8'}</strong>
                  </td>
                  <td>
                    <strong>{formatPrice(r.walletBalance)}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        r.isAvailable ? 'admin-badge-success' : 'admin-badge-neutral'
                      }`}
                    >
                      {r.isAvailable ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        r.verificationStatus === 'approved'
                          ? 'admin-badge-success'
                          : r.verificationStatus === 'rejected'
                          ? 'admin-badge-danger'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {r.verificationStatus?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="View KYC & Bank Details"
                        onClick={() => setKycModal({ open: true, rider: r })}
                      >
                        <Eye size={14} />
                      </button>

                      {r.verificationStatus === 'pending' ? (
                        <>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            title="Approve Rider"
                            onClick={() =>
                              setVerifyModal({ open: true, rider: r, status: 'approved', reason: '' })
                            }
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            title="Reject Rider"
                            onClick={() =>
                              setVerifyModal({ open: true, rider: r, status: 'rejected', reason: '' })
                            }
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          className={`admin-btn admin-btn-sm ${
                            r.isSuspended ? 'admin-btn-secondary' : 'admin-btn-danger'
                          }`}
                          title={r.isSuspended ? 'Reactivate' : 'Suspend'}
                          onClick={() => setSuspendModal({ open: true, rider: r, reason: '' })}
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
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total riders)
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

      {/* KYC Document Inspection Modal */}
      {kycModal.open && kycModal.rider && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Rider KYC & Operational Profile</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setKycModal({ open: false, rider: null })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <img
                  src={kycModal.rider.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={kycModal.rider.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{kycModal.rider.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#78716C' }}>
                    {kycModal.rider.phone} • {kycModal.rider.email}
                  </span>
                </div>
              </div>

              {/* Vehicle & License Details */}
              <div style={{ background: '#FAFAF9', padding: '1rem', borderRadius: '8px', border: '1px solid #E7E5E4', marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#292524' }}>
                  Vehicle & Driver License Details
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#78716C' }}>Vehicle Type:</span>{' '}
                    <strong>{kycModal.rider.vehicleDetails?.vehicleType || 'Motorcycle'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C' }}>License Plate:</span>{' '}
                    <strong>{kycModal.rider.vehicleDetails?.registrationNumber || 'DL-01-FD-5678'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C' }}>License Number:</span>{' '}
                    <strong>{kycModal.rider.documents?.drivingLicenseNumber || 'DL-9876543210'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C' }}>Aadhar / National ID:</span>{' '}
                    <strong>{kycModal.rider.documents?.aadharNumber || 'XXXX-XXXX-4589'}</strong>
                  </div>
                </div>
              </div>

              {/* Bank Settlement Account */}
              <div style={{ background: '#FAFAF9', padding: '1rem', borderRadius: '8px', border: '1px solid #E7E5E4' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#292524' }}>
                  Bank Settlement Details
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#78716C' }}>Account Holder:</span>{' '}
                    <strong>{kycModal.rider.bankDetails?.accountHolderName || kycModal.rider.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C' }}>Bank Name:</span>{' '}
                    <strong>{kycModal.rider.bankDetails?.bankName || 'HDFC Bank'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C' }}>Account Number:</span>{' '}
                    <strong>{kycModal.rider.bankDetails?.accountNumber || '9876543210'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#78716C' }}>IFSC Code:</span>{' '}
                    <strong>{kycModal.rider.bankDetails?.ifscCode || 'HDFC0001234'}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setKycModal({ open: false, rider: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Action Modal */}
      {verifyModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {verifyModal.status === 'approved' ? 'Approve Rider KYC' : 'Reject Rider Verification'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setVerifyModal({ open: false, rider: null, status: 'approved', reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Confirm {verifyModal.status} of KYC verification for <strong>{verifyModal.rider?.name}</strong>.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Reviewer Notes</label>
                <textarea
                  rows="3"
                  className="admin-form-control"
                  placeholder="e.g. License and Aadhar verified with government database..."
                  value={verifyModal.reason}
                  onChange={(e) => setVerifyModal({ ...verifyModal, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setVerifyModal({ open: false, rider: null, status: 'approved', reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${
                  verifyModal.status === 'approved' ? 'admin-btn-primary' : 'admin-btn-danger'
                }`}
                disabled={modalLoading}
                onClick={handleVerificationSubmit}
              >
                {modalLoading ? 'Saving...' : `Confirm ${verifyModal.status}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Modal */}
      {suspendModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {suspendModal.rider?.isSuspended ? 'Reactivate Rider' : 'Suspend Rider'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSuspendModal({ open: false, rider: null, reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Are you sure you want to{' '}
                <strong>{suspendModal.rider?.isSuspended ? 'reactivate' : 'suspend'}</strong>{' '}
                <strong>{suspendModal.rider?.name}</strong>?
              </p>
              {!suspendModal.rider?.isSuspended && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Reason for Suspension</label>
                  <textarea
                    rows="3"
                    className="admin-form-control"
                    placeholder="e.g. Repeated delivery delays, failed customer verification..."
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
                onClick={() => setSuspendModal({ open: false, rider: null, reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${
                  suspendModal.rider?.isSuspended ? 'admin-btn-primary' : 'admin-btn-danger'
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
