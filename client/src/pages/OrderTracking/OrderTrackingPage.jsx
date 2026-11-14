import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  UtensilsCrossed,
  Receipt,
  Star,
  ChevronLeft,
  XCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../../services/socket';
import OrderTrackingTimeline from '../../components/orders/OrderTrackingTimeline';
import OrderReceiptModal from '../../components/orders/OrderReceiptModal';
import ReviewModal from '../../components/orders/ReviewModal';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Socket.IO Real-time tracking
    const socket = getSocket();
    joinOrderRoom(orderId);

    const handleStatusUpdate = (update) => {
      setOrder((prev) => {
        if (!prev || prev._id !== update.orderId) return prev;
        return {
          ...prev,
          orderStatus: update.status,
          statusHistory: update.statusHistory || prev.statusHistory,
          rider: update.rider || prev.rider
        };
      });
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      leaveOrderRoom(orderId);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [orderId]);

  const handleSimulateStatus = async () => {
    try {
      setIsSimulating(true);
      const res = await api.post(`/orders/${orderId}/simulate-status`);
      setOrder(res.data.data);
    } catch (err) {
      console.error('Failed to simulate status:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('Please specify a reason for cancellation:') || 'Cancelled by customer';
    try {
      setIsCancelling(true);
      const res = await api.put(`/orders/${orderId}/cancel`, { reason });
      setOrder(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container text-center" style={{ padding: '5rem 1.5rem' }}>
        <h2>Order not found</h2>
        <Link to="/my-orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          View My Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.orderStatus === 'delivered';
  const isCancelled = order.orderStatus === 'cancelled';
  const canCancel = ['placed', 'confirmed'].includes(order.orderStatus);

  return (
    <div className="tracking-page-wrapper">
      <div className="container">
        {/* Top Back & Actions Header */}
        <div className="tracking-top-bar">
          <Link to="/my-orders" className="back-link">
            <ChevronLeft size={18} />
            <span>My Orders</span>
          </Link>

          <div className="tracking-actions-group">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setIsReceiptOpen(true)}
            >
              <Receipt size={15} />
              <span>Invoice</span>
            </button>

            {isDelivered && !order.isReviewed && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsReviewOpen(true)}
              >
                <Star size={15} />
                <span>Rate & Review</span>
              </button>
            )}

            {canCancel && (
              <button
                className="btn btn-outline btn-sm text-danger"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                <XCircle size={15} />
                <span>{isCancelling ? 'Cancelling...' : 'Cancel Order'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Order Header Banner */}
        <div className="order-live-banner">
          <div className="order-brand-col">
            <img
              src={order.restaurant.image}
              alt={order.restaurant.name}
              className="tracking-rest-logo"
            />
            <div>
              <span className="order-number-tag">ORDER #{order.orderNumber}</span>
              <h2 className="tracking-rest-title">{order.restaurant.name}</h2>
              <p className="order-date-text">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          <div className="order-status-badge-col">
            <span className={`status-pill ${order.orderStatus}`}>
              {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
            </span>
            <span className="order-total-amount">
              Paid: ₹{Math.round(order.pricing.finalAmount / 100)} ({order.payment.method.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Tracking Grid Layout */}
        <div className="tracking-content-grid">
          {/* Left: 6-Stage Timeline Stepper */}
          <div className="tracking-timeline-col">
            <OrderTrackingTimeline
              order={order}
              onSimulateStatus={handleSimulateStatus}
              isSimulating={isSimulating}
            />
          </div>

          {/* Right: Order Summary Details */}
          <div className="tracking-summary-col">
            {/* Delivery Address Card */}
            <div className="checkout-card" style={{ marginBottom: '1.25rem' }}>
              <div className="step-title-row">
                <MapPin size={18} className="text-orange" />
                <h4 className="step-heading" style={{ fontSize: '1rem' }}>Delivery Address</h4>
              </div>
              <p className="summary-recip">
                <strong>{order.deliveryAddress.recipientName}</strong> ({order.deliveryAddress.phone})
              </p>
              <p className="summary-addr">
                {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}, {order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
              </p>
              {order.deliveryAddress.deliveryInstructions && (
                <p className="summary-notes">Note: {order.deliveryAddress.deliveryInstructions}</p>
              )}
            </div>

            {/* Ordered Items List Card */}
            <div className="checkout-card">
              <div className="step-title-row">
                <UtensilsCrossed size={18} className="text-orange" />
                <h4 className="step-heading" style={{ fontSize: '1rem' }}>Items Ordered</h4>
              </div>

              <div className="tracking-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="tracking-item-row">
                    <div className="tracking-item-left">
                      <span className="tracking-item-qty">{item.quantity}x</span>
                      <div>
                        <h5 className="tracking-item-name">{item.name}</h5>
                        {item.size && (
                          <span className="tracking-item-custom">Size: {item.size.name}</span>
                        )}
                        {item.addOns && item.addOns.length > 0 && (
                          <span className="tracking-item-custom">
                            + {item.addOns.map((a) => a.name).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="tracking-item-price">
                      ₹{Math.round(item.itemTotal / 100)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              {/* Price Breakdown */}
              <div className="summary-bill">
                <div className="summary-bill-row">
                  <span>Subtotal</span>
                  <span>₹{Math.round(order.pricing.subtotal / 100)}</span>
                </div>
                <div className="summary-bill-row">
                  <span>Delivery Fee</span>
                  <span>{order.pricing.deliveryFee === 0 ? 'FREE' : `₹${Math.round(order.pricing.deliveryFee / 100)}`}</span>
                </div>
                <div className="summary-bill-row">
                  <span>Taxes (5% GST)</span>
                  <span>₹{Math.round(order.pricing.taxes / 100)}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="summary-bill-row text-success">
                    <span>Coupon Savings</span>
                    <span>-₹{Math.round(order.pricing.discount / 100)}</span>
                  </div>
                )}
                <div className="summary-divider" />
                <div className="summary-bill-row final-total-row">
                  <span>Total Amount</span>
                  <span className="final-total-amount">₹{Math.round(order.pricing.finalAmount / 100)}</span>
                </div>
              </div>

              {/* Need Help CTA */}
              <Link to="/support" className="need-help-link">
                <HelpCircle size={15} />
                <span>Need help with this order?</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <OrderReceiptModal
        order={order}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      {/* Review Modal */}
      <ReviewModal
        order={order}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSuccess={() => {
          setOrder({ ...order, isReviewed: true });
        }}
      />
    </div>
  );
}

