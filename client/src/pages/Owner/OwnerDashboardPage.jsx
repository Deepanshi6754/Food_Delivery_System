import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  DollarSign,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import ownerApi from '../../services/ownerApi';

export default function OwnerDashboardPage() {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (selectedPeriod) => {
    try {
      setIsLoading(true);
      const res = await ownerApi.get(`/dashboard/stats?period=${selectedPeriod}`);
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  if (isLoading && !data) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F97316' }}>
          Loading your kitchen analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: '#FEE2E2',
          padding: '1.5rem',
          borderRadius: '12px',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <AlertCircle size={24} />
        <div>
          <div style={{ fontWeight: 700 }}>Error loading dashboard</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  const { stats, chartData, statusDistribution, bestsellers, recentOrders, recentReviews } = data || {};

  return (
    <div>
      {/* Page Title & Quick Actions */}
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Kitchen Command Center</h1>
          <p>Real-time orders, store performance, and sales breakdown.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/owner/menu/add" className="owner-btn-primary">
            <Plus size={18} />
            <span>Add New Dish</span>
          </Link>
          <Link to="/owner/orders" className="owner-btn-secondary">
            <ShoppingBag size={18} />
            <span>Live Kitchen Board</span>
          </Link>
        </div>
      </div>

      {/* 7 KPI Statistics Cards */}
      <div className="owner-stats-grid">
        {/* Total Orders */}
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon orange">
              <ShoppingBag size={22} />
            </div>
            <span className="owner-stat-pill positive">+Active</span>
          </div>
          <div className="owner-stat-label">Total Orders</div>
          <div className="owner-stat-value">{stats?.totalOrders || 0}</div>
        </div>

        {/* Today's Orders */}
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon blue">
              <Clock size={22} />
            </div>
            <span className="owner-stat-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>
              Today
            </span>
          </div>
          <div className="owner-stat-label">Today's Orders</div>
          <div className="owner-stat-value">{stats?.todayOrders || 0}</div>
        </div>

        {/* Total Revenue */}
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon green">
              <DollarSign size={22} />
            </div>
            <span className="owner-stat-pill positive">Gross</span>
          </div>
          <div className="owner-stat-label">Total Revenue</div>
          <div className="owner-stat-value">
            ₹{((stats?.totalRevenue || 0) / 100).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon green">
              <TrendingUp size={22} />
            </div>
            <span className="owner-stat-pill positive">Today</span>
          </div>
          <div className="owner-stat-label">Today's Revenue</div>
          <div className="owner-stat-value">
            ₹{((stats?.todayRevenue || 0) / 100).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon yellow">
              <Clock size={22} />
            </div>
            <span className="owner-stat-pill" style={{ background: '#FEF3C7', color: '#D97706' }}>
              Kitchen
            </span>
          </div>
          <div className="owner-stat-label">Orders In Progress</div>
          <div className="owner-stat-value">{stats?.pendingOrders || 0}</div>
        </div>

        {/* Completed Orders */}
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon green">
              <CheckCircle2 size={22} />
            </div>
            <span className="owner-stat-pill positive">Fulfilled</span>
          </div>
          <div className="owner-stat-label">Delivered Orders</div>
          <div className="owner-stat-value">{stats?.completedOrders || 0}</div>
        </div>

        {/* Avg Rating */}
        <div className="owner-stat-card">
          <div className="owner-stat-top">
            <div className="owner-stat-icon yellow">
              <Star size={22} />
            </div>
            <span className="owner-stat-pill" style={{ background: '#FEF3C7', color: '#B45309' }}>
              {stats?.totalReviews || 0} reviews
            </span>
          </div>
          <div className="owner-stat-label">Store Rating</div>
          <div className="owner-stat-value">
            {stats?.avgRating ? stats.avgRating.toFixed(1) : '4.5'} ★
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="owner-grid-2col">
        {/* Sales Trend Chart */}
        <div className="owner-card">
          <div className="owner-card-header">
            <div>
              <h2 className="owner-card-title">Sales & Revenue Trend</h2>
              <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
                Total income in ₹ over selected timeframe
              </span>
            </div>
            <div className="owner-period-tabs">
              {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`owner-period-btn ${period === p ? 'active' : ''}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                <XAxis dataKey="label" stroke="#78716C" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#78716C"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue (₹)' : 'Orders'
                  ]}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #E7E5E4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Breakdown Chart */}
        <div className="owner-card">
          <div className="owner-card-header">
            <h2 className="owner-card-title">Order Status Distribution</h2>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            {statusDistribution && statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#78716C'
                }}
              >
                No order history recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Bottom: Recent Orders & Bestselling Dishes */}
      <div className="owner-grid-2col">
        {/* Recent Orders Table */}
        <div className="owner-card">
          <div className="owner-card-header">
            <h2 className="owner-card-title">Recent Kitchen Orders</h2>
            <Link
              to="/owner/orders"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#F97316',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>View All</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="owner-table-container">
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: 700, color: '#292524' }}>
                        {ord.orderNumber}
                      </td>
                      <td>{ord.deliveryAddress?.recipientName || 'Customer'}</td>
                      <td style={{ color: '#78716C' }}>
                        {ord.items?.length} item{ord.items?.length > 1 ? 's' : ''}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹{((ord.pricing?.finalAmount || 0) / 100).toFixed(0)}
                      </td>
                      <td>
                        <span className={`order-status-pill ${ord.orderStatus}`}>
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#78716C' }}>
                      No incoming orders at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bestselling Food Items */}
        <div className="owner-card">
          <div className="owner-card-header">
            <h2 className="owner-card-title">Top Bestselling Dishes</h2>
            <Link
              to="/owner/menu"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#F97316',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Menu</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bestsellers && bestsellers.length > 0 ? (
              bestsellers.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.75rem',
                    borderBottom: idx !== bestsellers.length - 1 ? '1px solid #E7E5E4' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: idx === 0 ? '#FEF3C7' : '#F5F5F4',
                        color: idx === 0 ? '#B45309' : '#78716C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}
                    >
                      {idx + 1}
                    </span>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                      alt={item.name}
                      style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#292524' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#78716C' }}>
                        {item.quantitySold} portions ordered
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#F97316' }}>
                      ₹{((item.totalRevenue || 0) / 100).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#78716C', fontSize: '0.875rem', textAlign: 'center' }}>
                Dish sales data will populate as orders are completed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

