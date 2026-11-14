import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  UserCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

  // Modals
  const [viewModal, setViewModal] = useState({ open: false, order: null });
  const [overrideModal, setOverrideModal] = useState({ open: false, order: null, status: 'delivered', reason: '' });
  const [refundModal, setRefundModal] = useState({ open: false, order: null, amount: '', reason: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/orders', {
        params: { search, status, paymentStatus, page, limit: 10 }
      });
      if (res.data.success) {
        setOrders(res.data.data.orders || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1, limit: 10 });
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleOverrideStatus = async () => {
    if (!overrideModal.order) return;
    if (!overrideModal.reason.trim()) {
      alert('Please provide a mandatory reason for this status override.');
      return;
    }
    setModalLoading(true);
    try {
      await adminApi.patch(`/orders/${overrideModal.order._id}/override-status`, {
        status: overrideModal.status,
        reason: overrideModal.reason
      });
      setOverrideModal({ open: false, order: null, status: 'delivered', reason: '' });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to override order status.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    if (!refundModal.order) return;
    setModalLoading(true);
    try {
      await adminApi.post('/finance/refunds', {
        orderId: refundModal.order._id,
        amount: refundModal.amount ? Math.round(Number(refundModal.amount) * 100) : refundModal.order.pricing?.total,
        reason: refundModal.reason || 'Admin initiated refund from order page'
      });
      alert('Refund request submitted successfully to Finance queue.');
      setRefundModal({ open: false, order: null, amount: '', reason: '' });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger refund.');
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
          <h1 className="admin-page-title">Live Orders Central</h1>
          <p className="admin-page-subtitle">
            Monitor real-time fulfillment, override stalled statuses, assign riders, and process emergency refunds
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
              placeholder="Search by Order #, customer, or phone..."
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
            <option value="all">All Order Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready for Pickup</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="admin-select"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Restaurant</th>
              <th>Assigned Rider</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Fulfillment Status</th>
              <th>Created At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  Loading platform orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#78716C' }}>
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, fontWeight: 700, color: '#F97316', cursor: 'pointer' }}
                      onClick={() => setViewModal({ open: true, order: o })}
                    >
                      #{o.orderNumber}
                    </button>
                  </td>
                  <td>
                    <strong style={{ display: 'block', fontSize: '0.85rem' }}>{o.user?.name || 'Customer'}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#78716C' }}>{o.user?.phone || ''}</span>
                  </td>
                  <td>
                    <strong style={{ display: 'block', fontSize: '0.85rem' }}>{o.restaurant?.name || 'Restaurant'}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#78716C' }}>{o.items?.length || 0} items</span>
                  </td>
                  <td>
                    {o.rider ? (
                      <span className="admin-badge admin-badge-info">{o.rider.name}</span>
                    ) : (
                      <span className="admin-badge admin-badge-neutral">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <strong>{formatPrice(o.pricing?.total)}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        o.payment?.status === 'completed'
                          ? 'admin-badge-success'
                          : o.payment?.status === 'refunded'
                          ? 'admin-badge-info'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {o.payment?.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        o.status === 'delivered'
                          ? 'admin-badge-success'
                          : o.status === 'cancelled'
                          ? 'admin-badge-danger'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {o.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#78716C' }}>
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="View Full Details"
                        onClick={() => setViewModal({ open: true, order: o })}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        title="Override Order Status"
                        onClick={() =>
                          setOverrideModal({ open: true, order: o, status: o.status, reason: '' })
                        }
                      >
                        <RefreshCw size={14} />
                      </button>
                      {o.payment?.status === 'completed' && (
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Trigger Refund"
                          onClick={() =>
                            setRefundModal({
                              open: true,
                              order: o,
                              amount: ((o.pricing?.total || 0) / 100).toFixed(2),
                              reason: ''
                            })
                          }
                        >
                          <RotateCcw size={14} color="#D97706" />
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
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
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

      {/* View Order Detail Modal */}
      {viewModal.open && viewModal.order && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Order #{viewModal.order.orderNumber}</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setViewModal({ open: false, order: null })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              {/* Order Status & Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E7E5E4' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#78716C' }}>Current Status:</span>
                  <strong style={{ display: 'block', fontSize: '1rem', textTransform: 'uppercase', color: '#F97316' }}>
                    {viewModal.order.status?.replace('_', ' ')}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#78716C' }}>Payment Method:</span>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                    {viewModal.order.payment?.method?.toUpperCase()} ({viewModal.order.payment?.status})
                  </strong>
                </div>
              </div>

              {/* Items Breakdown */}
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Ordered Items</strong>
                <div style={{ background: '#FAFAF9', borderRadius: '8px', border: '1px solid #E7E5E4', padding: '0.75rem' }}>
                  {viewModal.order.items?.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        padding: '0.35rem 0',
                        borderBottom: idx < viewModal.order.items.length - 1 ? '1px dashed #E7E5E4' : 'none'
                      }}
                    >
                      <span>
                        {it.quantity}x {it.name}
                      </span>
                      <strong>{formatPrice(it.price * it.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#78716C', display: 'block' }}>Subtotal: {formatPrice(viewModal.order.pricing?.subtotal)}</span>
                  <span style={{ color: '#78716C', display: 'block' }}>Delivery Fee: {formatPrice(viewModal.order.pricing?.deliveryFee)}</span>
                  <span style={{ color: '#78716C', display: 'block' }}>Taxes & Charges: {formatPrice(viewModal.order.pricing?.tax)}</span>
                  <span style={{ color: '#78716C', display: 'block' }}>Discounts: -{formatPrice(viewModal.order.pricing?.discount)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#78716C' }}>Total Billed:</span>
                  <strong style={{ fontSize: '1.35rem', color: '#15803D', display: 'block' }}>
                    {formatPrice(viewModal.order.pricing?.total)}
                  </strong>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ background: '#FAFAF9', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E7E5E4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <MapPin size={14} color="#F97316" />
                  <strong style={{ fontSize: '0.85rem' }}>Delivery Destination</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#78716C' }}>
                  {viewModal.order.deliveryAddress?.recipientName} ({viewModal.order.deliveryAddress?.phone})<br />
                  {viewModal.order.deliveryAddress?.houseNo ? `${viewModal.order.deliveryAddress?.houseNo}, ` : ''}
                  {viewModal.order.deliveryAddress?.street ? `${viewModal.order.deliveryAddress?.street}, ` : ''}
                  {viewModal.order.deliveryAddress?.area || ''}, {viewModal.order.deliveryAddress?.city}
                </p>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setViewModal({ open: false, order: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Status Modal */}
      {overrideModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Administrative Status Override</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setOverrideModal({ open: false, order: null, status: 'delivered', reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Override current status of Order <strong>#{overrideModal.order?.orderNumber}</strong>. This action is permanently logged to the security audit trail.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">New Order Status</label>
                <select
                  className="admin-form-control"
                  value={overrideModal.status}
                  onChange={(e) => setOverrideModal({ ...overrideModal, status: e.target.value })}
                >
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered (Completed)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Mandatory Operational Reason *</label>
                <textarea
                  rows="3"
                  required
                  className="admin-form-control"
                  placeholder="e.g. Rider vehicle breakdown, customer confirmed arrival, kitchen system sync failure..."
                  value={overrideModal.reason}
                  onChange={(e) => setOverrideModal({ ...overrideModal, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setOverrideModal({ open: false, order: null, status: 'delivered', reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={modalLoading}
                onClick={handleOverrideStatus}
              >
                {modalLoading ? 'Updating...' : 'Confirm Status Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Refund Trigger Modal */}
      {refundModal.open && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Initiate Customer Refund</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setRefundModal({ open: false, order: null, amount: '', reason: '' })}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>
                Initiate a refund record for Order <strong>#{refundModal.order?.orderNumber}</strong>.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Refund Amount in Rupees (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="admin-form-control"
                  value={refundModal.amount}
                  onChange={(e) => setRefundModal({ ...refundModal, amount: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Refund Reason</label>
                <textarea
                  rows="2"
                  className="admin-form-control"
                  placeholder="e.g. Food quality defect, wrong dish delivered, cancellation..."
                  value={refundModal.reason}
                  onChange={(e) => setRefundModal({ ...refundModal, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setRefundModal({ open: false, order: null, amount: '', reason: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={modalLoading}
                onClick={handleCreateRefund}
              >
                {modalLoading ? 'Submitting...' : 'Submit to Refund Queue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
