import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Check,
  X,
  Flame,
  PackageCheck,
  Clock,
  MapPin,
  FileText,
  User,
  Phone,
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import ownerApi from '../../services/ownerApi';
import { getSocket } from '../../services/socket';

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modals for actions
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptModalOrder, setAcceptModalOrder] = useState(null);
  const [prepTime, setPrepTime] = useState(25);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (search) params.append('search', search);

      const res = await ownerApi.get(`/orders?${params.toString()}`);
      setOrders(res.data.orders || []);
      setCounts(res.data.counts || {});
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Listen for real-time order updates
  useEffect(() => {
    const socket = getSocket();
    const handleUpdate = () => {
      fetchOrders();
    };
    socket.on('order_updated', handleUpdate);
    return () => {
      socket.off('order_updated', handleUpdate);
    };
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Actions
  const handleAcceptOrder = async () => {
    if (!acceptModalOrder) return;
    try {
      setActionLoading(true);
      await ownerApi.put(`/orders/${acceptModalOrder._id}/accept`, {
        prepTimeMinutes: prepTime
      });
      setAcceptModalOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectModalOrder || !rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      await ownerApi.put(`/orders/${rejectModalOrder._id}/reject`, {
        reason: rejectReason
      });
      setRejectModalOrder(null);
      setRejectReason('');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartPrep = async (orderId) => {
    try {
      await ownerApi.put(`/orders/${orderId}/prepare`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start preparation.');
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await ownerApi.put(`/orders/${orderId}/ready`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark ready.');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: counts.all },
    { id: 'placed', label: 'New Orders', count: counts.placed, highlight: true },
    { id: 'confirmed', label: 'Accepted', count: counts.confirmed },
    { id: 'preparing', label: 'In Kitchen', count: counts.preparing },
    { id: 'ready_for_pickup', label: 'Ready for Pickup', count: counts.ready_for_pickup },
    { id: 'delivered', label: 'Delivered', count: counts.delivered },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled }
  ];

  return (
    <div>
      {/* Header */}
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Live Kitchen Order Management</h1>
          <p>Instant alerts and step-by-step kitchen status controls.</p>
        </div>
        <button onClick={fetchOrders} className="owner-btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #E7E5E4'
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              border: activeTab === tab.id ? '2px solid #F97316' : '1px solid #E7E5E4',
              background: activeTab === tab.id ? '#FFEDD5' : '#ffffff',
              color: activeTab === tab.id ? '#EA580C' : '#292524',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                background: tab.highlight && tab.count > 0 ? '#DC2626' : activeTab === tab.id ? '#EA580C' : '#F5F5F4',
                color: tab.highlight && tab.count > 0 ? '#fff' : activeTab === tab.id ? '#fff' : '#78716C',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800
              }}
            >
              {tab.count || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem', maxWidth: '400px', display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="owner-form-input"
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search
            size={18}
            color="#A8A29E"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
        <button type="submit" className="owner-btn-secondary">
          Filter
        </button>
      </form>

      {/* Orders Grid / Cards */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#F97316', fontWeight: 700 }}>
          Loading kitchen orders...
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #E7E5E4',
            padding: '3rem 1.5rem',
            textAlign: 'center'
          }}
        >
          <ShoppingBag size={48} color="#D6D3D1" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#292524' }}>No orders found</h3>
          <p style={{ margin: 0, color: '#78716C', fontSize: '0.9rem' }}>
            There are currently no orders in this status category.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {orders.map((ord) => {
            const isPlaced = ord.orderStatus === 'placed';
            const isConfirmed = ord.orderStatus === 'confirmed';
            const isPreparing = ord.orderStatus === 'preparing';
            const isReady = ord.orderStatus === 'ready_for_pickup';
            const isDelivered = ord.orderStatus === 'delivered';

            return (
              <div
                key={ord._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: isPlaced ? '2px solid #F97316' : '1px solid #E7E5E4',
                  boxShadow: isPlaced ? '0 8px 24px rgba(249, 115, 22, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    padding: '1rem',
                    background: isPlaced ? '#FFF8F0' : '#FAFAF9',
                    borderBottom: '1px solid #E7E5E4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#292524' }}>
                      {ord.orderNumber}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '2px' }}>
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`order-status-pill ${ord.orderStatus}`}>
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Customer Details */}
                <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #E7E5E4', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#292524' }}>
                    <User size={16} color="#78716C" />
                    <span>{ord.deliveryAddress?.recipientName}</span>
                    <span style={{ color: '#78716C', fontWeight: 500 }}>• {ord.deliveryAddress?.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#78716C', marginTop: '0.35rem' }}>
                    <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      {ord.deliveryAddress?.houseNo}, {ord.deliveryAddress?.street}, {ord.deliveryAddress?.area}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ padding: '1rem', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Items Ordered ({ord.items?.reduce((s, i) => s + i.quantity, 0)})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {ord.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span
                            style={{
                              background: '#F5F5F4',
                              color: '#292524',
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem'
                            }}
                          >
                            {item.quantity}×
                          </span>
                          <div>
                            <span style={{ fontWeight: 600, color: '#292524' }}>{item.name}</span>
                            {item.size?.name && (
                              <div style={{ fontSize: '0.75rem', color: '#78716C' }}>Size: {item.size.name}</div>
                            )}
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: '#292524' }}>
                          ₹{(item.itemTotal / 100).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special Cooking Instructions if any */}
                  {ord.deliveryAddress?.deliveryInstructions && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        background: '#FEF3C7',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: '#92400E'
                      }}
                    >
                      <strong>Note:</strong> {ord.deliveryAddress.deliveryInstructions}
                    </div>
                  )}
                </div>

                {/* Payment & Amount Summary */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#FAFAF9',
                    borderTop: '1px solid #E7E5E4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    Method: <strong style={{ textTransform: 'uppercase', color: '#292524' }}>{ord.payment?.method}</strong> (
                    {ord.payment?.status})
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F97316' }}>
                    ₹{((ord.pricing?.finalAmount || 0) / 100).toFixed(0)}
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #E7E5E4', display: 'flex', gap: '0.5rem' }}>
                  {isPlaced && (
                    <>
                      <button
                        onClick={() => setAcceptModalOrder(ord)}
                        className="owner-btn-primary"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <Check size={16} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => setRejectModalOrder(ord)}
                        className="owner-btn-secondary"
                        style={{ color: '#DC2626', borderColor: '#FECACA' }}
                      >
                        <X size={16} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => handleStartPrep(ord._id)}
                      className="owner-btn-primary"
                      style={{ flex: 1, justifyContent: 'center', background: '#EA580C' }}
                    >
                      <Flame size={16} />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleMarkReady(ord._id)}
                      className="owner-btn-primary"
                      style={{ flex: 1, justifyContent: 'center', background: '#0284C7' }}
                    >
                      <PackageCheck size={16} />
                      <span>Ready for Pickup</span>
                    </button>
                  )}

                  {isReady && (
                    <div
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#0284C7',
                        padding: '0.5rem'
                      }}
                    >
                      Waiting for Rider Pickup
                    </div>
                  )}

                  {isDelivered && (
                    <div
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#15803D',
                        padding: '0.5rem'
                      }}
                    >
                      Delivered by Rider
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedOrder(ord)}
                    className="owner-btn-secondary"
                    style={{ padding: '0.5rem' }}
                    title="View Timeline & Details"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Order Modal */}
      {acceptModalOrder && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: '440px' }}>
            <div className="owner-modal-header">
              <h3>Accept Order #{acceptModalOrder.orderNumber}</h3>
              <button
                onClick={() => setAcceptModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="owner-modal-body">
              <p style={{ margin: '0 0 1rem 0', color: '#78716C', fontSize: '0.9rem' }}>
                Confirm acceptance of this order and set estimated kitchen preparation time:
              </p>
              <div className="owner-form-group">
                <label>Preparation Time (Minutes)</label>
                <select
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                  className="owner-form-select"
                >
                  <option value={15}>15 Minutes (Express)</option>
                  <option value={20}>20 Minutes</option>
                  <option value={25}>25 Minutes (Standard)</option>
                  <option value={35}>35 Minutes (Large Order)</option>
                  <option value={45}>45 Minutes (Peak Hour)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleAcceptOrder}
                  disabled={actionLoading}
                  className="owner-btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {actionLoading ? 'Confirming...' : 'Confirm & Notify Rider'}
                </button>
                <button
                  onClick={() => setAcceptModalOrder(null)}
                  className="owner-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: '440px' }}>
            <div className="owner-modal-header">
              <h3>Reject Order #{rejectModalOrder.orderNumber}</h3>
              <button
                onClick={() => setRejectModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="owner-modal-body">
              <p style={{ margin: '0 0 1rem 0', color: '#78716C', fontSize: '0.9rem' }}>
                Please specify the reason for rejecting this order (customer will be notified immediately):
              </p>
              <div className="owner-form-group">
                <label>Rejection Reason *</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g., Kitchen running at maximum capacity / specific item out of stock"
                  className="owner-form-textarea"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleRejectOrder}
                  disabled={actionLoading}
                  className="owner-btn-primary"
                  style={{ flex: 1, justifyContent: 'center', background: '#DC2626' }}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Order'}
                </button>
                <button
                  onClick={() => setRejectModalOrder(null)}
                  className="owner-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Full Order Details Modal */}
      {selectedOrder && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: '580px' }}>
            <div className="owner-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Order Details</h3>
                <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
                  {selectedOrder.orderNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="owner-modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#78716C', textTransform: 'uppercase' }}>
                  Status Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedOrder.statusHistory?.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#F97316',
                          marginTop: '6px'
                        }}
                      />
                      <div>
                        <strong style={{ textTransform: 'capitalize' }}>
                          {step.status.replace(/_/g, ' ')}
                        </strong>{' '}
                        <span style={{ color: '#78716C', fontSize: '0.75rem' }}>
                          ({new Date(step.timestamp).toLocaleTimeString()})
                        </span>
                        {step.note && (
                          <div style={{ color: '#78716C', fontSize: '0.8rem' }}>{step.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E7E5E4', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span>Subtotal:</span>
                  <span>₹{((selectedOrder.pricing?.subtotal || 0) / 100).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span>Taxes (5% GST):</span>
                  <span>₹{((selectedOrder.pricing?.taxes || 0) / 100).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span>Platform Commission (15%):</span>
                  <span style={{ color: '#DC2626' }}>
                    -₹{(((selectedOrder.pricing?.finalAmount || 0) * 0.15) / 100).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: '#15803D', marginTop: '0.75rem', borderTop: '1px solid #E7E5E4', paddingTop: '0.75rem' }}>
                  <span>Net Kitchen Earnings:</span>
                  <span>
                    ₹{(((selectedOrder.pricing?.finalAmount || 0) * 0.85) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

