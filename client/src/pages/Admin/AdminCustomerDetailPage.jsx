import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingBag,
  Clock,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Ban
} from 'lucide-react';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await adminApi.get(`/customers/${id}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load customer profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#78716C' }}>
        Loading customer record...
      </div>
    );
  }

  if (!data || !data.customer) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Customer Not Found</h2>
        <Link to="/admin/customers" className="admin-btn admin-btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Return to Directory
        </Link>
      </div>
    );
  }

  const { customer, addresses = [], orders = [], stats = {} } = data;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/customers" className="admin-icon-btn">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="admin-page-title">{customer.name}</h1>
            <p className="admin-page-subtitle">Customer ID: {customer._id}</p>
          </div>
        </div>
        <span
          className={`admin-badge ${
            customer.isSuspended ? 'admin-badge-danger' : 'admin-badge-success'
          }`}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        >
          {customer.isSuspended ? 'Account Suspended' : 'Active Account'}
        </span>
      </div>

      {/* Stats summary */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Lifetime Spend</span>
          </div>
          <div className="admin-kpi-value">{formatPrice(stats.totalSpent)}</div>
          <div className="admin-kpi-trend" style={{ color: '#15803D' }}>
            <span>Delivered volume</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Total Orders Placed</span>
          </div>
          <div className="admin-kpi-value">{stats.totalOrders || 0}</div>
          <div className="admin-kpi-trend" style={{ color: '#0284C7' }}>
            <span>{stats.deliveredOrders || 0} delivered</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Cancelled Orders</span>
          </div>
          <div className="admin-kpi-value" style={{ color: stats.cancelledOrders > 0 ? '#DC2626' : '#292524' }}>
            {stats.cancelledOrders || 0}
          </div>
          <div className="admin-kpi-trend" style={{ color: '#78716C' }}>
            <span>Refunds / Cancellations</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Saved Addresses</span>
          </div>
          <div className="admin-kpi-value">{addresses.length}</div>
          <div className="admin-kpi-trend" style={{ color: '#78716C' }}>
            <span>Delivery destinations</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Profile Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Customer Information</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <img
              src={customer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={customer.name}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <strong style={{ fontSize: '1rem' }}>{customer.name}</strong>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#78716C' }}>
                Role: {customer.role}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="#78716C" />
              <span>{customer.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} color="#78716C" />
              <span>{customer.phone || 'No phone recorded'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="#78716C" />
              <span>Registered on {new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Saved Delivery Addresses</h3>
          </div>
          {addresses.length === 0 ? (
            <div style={{ color: '#78716C', fontSize: '0.875rem' }}>No saved addresses found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  style={{
                    padding: '0.75rem',
                    background: '#FAFAF9',
                    borderRadius: '8px',
                    border: '1px solid #E7E5E4',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <MapPin size={14} color="#F97316" />
                    <strong>{addr.label || 'Address'}</strong>
                    {addr.isDefault && <span className="admin-badge admin-badge-success">Default</span>}
                  </div>
                  <p style={{ margin: 0, color: '#78716C' }}>
                    {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.street ? `${addr.street}, ` : ''}{addr.area || ''}, {addr.city} {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders History */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Customer Order History</h3>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Restaurant</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    This customer has not placed any orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <Link to={`/admin/orders`} style={{ fontWeight: 600, color: '#F97316', textDecoration: 'none' }}>
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td>{o.restaurant?.name || 'Restaurant'}</td>
                    <td>{formatPrice(o.pricing?.total)}</td>
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
                    <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
