import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import {
  DollarSign,
  ShoppingBag,
  Store,
  Bike,
  Users,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await adminApi.get('/dashboard/overview');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ color: '#F97316', fontWeight: 600, fontSize: '1.1rem' }}>
          Loading real-time executive dashboard...
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const alerts = kpis.alerts || {};
  const sevenDayTrend = data?.sevenDayTrend || [];
  const recentOrders = data?.recentOrders || [];

  const formatPrice = (paise) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const hasAlerts =
    alerts.pendingRestaurants > 0 ||
    alerts.pendingRiders > 0 ||
    alerts.openTickets > 0 ||
    alerts.pendingRefunds > 0;

  return (
    <div>
      {/* Page Title */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Executive Overview</h1>
          <p className="admin-page-subtitle">
            Real-time monitoring across customers, restaurants, delivery fleet, and orders
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/orders" className="admin-btn admin-btn-primary">
            <ShoppingBag size={16} />
            <span>Manage Orders</span>
          </Link>
          <Link to="/admin/reports" className="admin-btn admin-btn-secondary">
            <span>Export Reports</span>
          </Link>
        </div>
      </div>

      {/* Operational Attention Banner */}
      {hasAlerts && (
        <div
          style={{
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="#D97706" />
            <div>
              <strong style={{ color: '#92400E', fontSize: '0.9rem', display: 'block' }}>
                Operational Approvals & Action Items Required
              </strong>
              <span style={{ color: '#B45309', fontSize: '0.8rem' }}>
                {alerts.pendingRestaurants > 0 && `${alerts.pendingRestaurants} restaurants pending approval. `}
                {alerts.pendingRiders > 0 && `${alerts.pendingRiders} riders waiting for KYC verification. `}
                {alerts.pendingRefunds > 0 && `${alerts.pendingRefunds} refund requests need review. `}
                {alerts.openTickets > 0 && `${alerts.openTickets} support tickets awaiting response.`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {alerts.pendingRestaurants > 0 && (
              <Link to="/admin/restaurants?approvalStatus=pending" className="admin-btn admin-btn-secondary admin-btn-sm">
                Review Restaurants
              </Link>
            )}
            {alerts.pendingRiders > 0 && (
              <Link to="/admin/riders?verificationStatus=pending" className="admin-btn admin-btn-secondary admin-btn-sm">
                Verify Riders
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Grid (8 Cards) */}
      <div className="admin-kpi-grid">
        {/* GMV */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Gross Merchandise Value</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#DCFCE7', color: '#15803D' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="admin-kpi-value">{formatPrice(kpis.grossRevenue)}</div>
          <div className="admin-kpi-trend" style={{ color: '#15803D' }}>
            <TrendingUp size={14} />
            <span>Today: {formatPrice(kpis.grossRevenueToday)}</span>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Platform Net Commission</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#FFEDD5', color: '#F97316' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="admin-kpi-value">{formatPrice(kpis.platformCommission)}</div>
          <div className="admin-kpi-trend" style={{ color: '#F97316' }}>
            <span>Avg 15% Platform Fee</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Total Orders</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.totalOrders || 0}</div>
          <div className="admin-kpi-trend" style={{ color: '#0284C7' }}>
            <span>Today: {kpis.ordersToday || 0} orders</span>
          </div>
        </div>

        {/* Live Active Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Live In-Flight Orders</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#D97706' }}>
            {kpis.activeOrders || 0}
          </div>
          <div className="admin-kpi-trend" style={{ color: '#78716C' }}>
            <span>Preparing & Out for Delivery</span>
          </div>
        </div>

        {/* Customers */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Total Customers</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#F3E8FF', color: '#9333EA' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.customers?.total || 0}</div>
          <div className="admin-kpi-trend" style={{ color: '#15803D' }}>
            <span>{kpis.customers?.active || 0} active accounts</span>
          </div>
        </div>

        {/* Restaurants */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Partner Restaurants</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#FFE4E6', color: '#E11D48' }}>
              <Store size={20} />
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.restaurants?.total || 0}</div>
          <div className="admin-kpi-trend" style={{ color: '#78716C' }}>
            <span>{kpis.restaurants?.approved || 0} approved / {kpis.restaurants?.pending || 0} pending</span>
          </div>
        </div>

        {/* Delivery Riders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Rider Fleet</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#CCFBF1', color: '#0F766E' }}>
              <Bike size={20} />
            </div>
          </div>
          <div className="admin-kpi-value">{kpis.riders?.total || 0}</div>
          <div className="admin-kpi-trend" style={{ color: '#0F766E' }}>
            <span>{kpis.riders?.online || 0} currently online & active</span>
          </div>
        </div>

        {/* Settled Payouts */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Settled Payouts</span>
            <div className="admin-kpi-icon-wrap" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="admin-kpi-value">
            {formatPrice((kpis.totalRestaurantPayouts || 0) + (kpis.totalRiderPayouts || 0))}
          </div>
          <div className="admin-kpi-trend" style={{ color: '#78716C' }}>
            <span>Restaurants & Riders</span>
          </div>
        </div>
      </div>

      {/* Visual Charts & Status Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* 7-Day Revenue Trend */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">7-Day Gross Merchandise Trend</h3>
            <span style={{ fontSize: '0.75rem', color: '#78716C' }}>Daily Delivered Volumes</span>
          </div>
          {sevenDayTrend.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
              No order data in the last 7 days.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem' }}>
              {sevenDayTrend.map((d) => {
                const max = Math.max(...sevenDayTrend.map((t) => t.gross || 1));
                const heightPercent = Math.max(15, Math.round(((d.gross || 0) / max) * 140));
                return (
                  <div key={d._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#292524' }}>
                      {formatPrice(d.gross)}
                    </span>
                    <div
                      style={{
                        width: '32px',
                        height: `${heightPercent}px`,
                        background: 'linear-gradient(180deg, #F97316 0%, #EA580C 100%)',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 2px 6px rgba(249, 115, 22, 0.2)'
                      }}
                      title={`${d._id}: ${d.orders} orders (${formatPrice(d.gross)})`}
                    />
                    <span style={{ fontSize: '0.65rem', color: '#78716C', whiteSpace: 'nowrap' }}>
                      {d._id.substring(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Order Status Distribution</h3>
            <span style={{ fontSize: '0.75rem', color: '#78716C' }}>All-Time Performance</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#15803D' }} />
                Delivered
              </span>
              <strong>{kpis.deliveredOrders || 0}</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#F5F5F4', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((kpis.deliveredOrders || 0) / (kpis.totalOrders || 1)) * 100}%`,
                  height: '100%',
                  background: '#15803D'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F97316' }} />
                In Progress (Active)
              </span>
              <strong>{kpis.activeOrders || 0}</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#F5F5F4', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((kpis.activeOrders || 0) / (kpis.totalOrders || 1)) * 100}%`,
                  height: '100%',
                  background: '#F97316'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#DC2626' }} />
                Cancelled
              </span>
              <strong>{kpis.cancelledOrders || 0}</strong>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#F5F5F4', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${((kpis.cancelledOrders || 0) / (kpis.totalOrders || 1)) * 100}%`,
                  height: '100%',
                  background: '#DC2626'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Platform Orders</h3>
          <Link to="/admin/orders" className="admin-btn admin-btn-secondary admin-btn-sm">
            View All Orders
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Placed At</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <Link
                        to={`/admin/orders`}
                        style={{ fontWeight: 600, color: '#F97316', textDecoration: 'none' }}
                      >
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{o.user?.name || 'Customer'}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#78716C' }}>
                          {o.user?.phone || ''}
                        </span>
                      </div>
                    </td>
                    <td>{o.restaurant?.name || 'Restaurant'}</td>
                    <td>
                      <strong>{formatPrice(o.pricing?.total)}</strong>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-neutral">
                        {o.payment?.method?.toUpperCase() || 'COD'}
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
