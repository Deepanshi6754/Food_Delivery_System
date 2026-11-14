import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  RotateCcw,
  Star,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import api from '../../services/api';
import { fetchCart } from '../../features/cart/cartSlice';
import OrderReceiptModal from '../../components/orders/OrderReceiptModal';
import ReviewModal from '../../components/orders/ReviewModal';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'delivered', 'cancelled'

  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const endpoint = activeTab === 'all' ? '/orders' : `/orders?status=${activeTab}`;
        const res = await api.get(endpoint);
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

  const handleReorder = async (orderId) => {
    try {
      setReorderingId(orderId);
      await api.post(`/orders/${orderId}/reorder`);
      dispatch(fetchCart());
      navigate('/checkout');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reorder items');
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="my-orders-page-wrapper">
      <div className="container">
        <div className="page-header-row">
          <div>
            <h1 className="page-heading">My Orders</h1>
            <p className="page-sub">Track real-time deliveries and view order history</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="orders-filter-tabs">
          <button
            className={`order-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders
          </button>
          <button
            className={`order-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Orders
          </button>
          <button
            className={`order-tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivered')}
          >
            Delivered
          </button>
          <button
            className={`order-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="orders-loading-stack">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton" style={{ height: 190, marginBottom: '1.25rem', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="orders-list-stack">
            {orders.map((order) => {
              const isActive = [
                'placed',
                'confirmed',
                'preparing',
                'ready_for_pickup',
                'out_for_delivery'
              ].includes(order.orderStatus);

              return (
                <div key={order._id} className="order-history-card">
                  {/* Card Top: Restaurant Info & Status */}
                  <div className="order-card-header">
                    <div className="order-rest-info">
                      <img
                        src={order.restaurant.image}
                        alt={order.restaurant.name}
                        className="order-rest-img"
                      />
                      <div>
                        <h3 className="order-rest-name">{order.restaurant.name}</h3>
                        <p className="order-meta-text">
                          Order #{order.orderNumber} •{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="order-status-group">
                      <span className={`status-pill ${order.orderStatus}`}>
                        {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="order-card-price">
                        ₹{Math.round(order.pricing.finalAmount / 100)}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-divider" />

                  {/* Card Middle: Items Summary */}
                  <div className="order-items-summary">
                    <p className="items-summary-text">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="order-card-divider" />

                  {/* Card Bottom: Action Buttons */}
                  <div className="order-card-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedReceiptOrder(order)}
                    >
                      <Receipt size={14} />
                      <span>View Invoice</span>
                    </button>

                    {isActive ? (
                      <Link
                        to={`/orders/${order._id}/track`}
                        className="btn btn-primary btn-sm"
                      >
                        <Clock size={14} />
                        <span>Track Delivery Live</span>
                      </Link>
                    ) : (
                      <div className="action-btns-right">
                        {order.orderStatus === 'delivered' && !order.isReviewed && (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedReviewOrder(order)}
                          >
                            <Star size={14} className="text-orange" />
                            <span>Rate Meal</span>
                          </button>
                        )}

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReorder(order._id)}
                          disabled={reorderingId === order._id}
                        >
                          <RotateCcw size={14} />
                          <span>{reorderingId === order._id ? 'Reordering...' : 'Reorder'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-results-box" style={{ padding: '4rem 1.5rem' }}>
            <Package size={52} className="text-muted" strokeWidth={1.5} />
            <h3 className="empty-title">No orders found in this category</h3>
            <p className="empty-desc">
              Whenever you order delicious food, you can track it live and view invoices right here.
            </p>
            <Link to="/restaurants" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
              Explore Restaurants
            </Link>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <OrderReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />

      {/* Review Modal */}
      <ReviewModal
        order={selectedReviewOrder}
        isOpen={!!selectedReviewOrder}
        onClose={() => setSelectedReviewOrder(null)}
        onSuccess={() => {
          setOrders(
            orders.map((o) =>
              o._id === selectedReviewOrder._id ? { ...o, isReviewed: true } : o
            )
          );
        }}
      />
    </div>
  );
}

