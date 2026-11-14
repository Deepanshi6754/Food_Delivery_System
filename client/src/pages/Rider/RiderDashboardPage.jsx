import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package, TrendingUp, IndianRupee, Star, CheckCircle2, 
  Navigation, Clock, ArrowRight, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toggleRiderAvailability } from '../../features/rider/riderAuthSlice';
import riderApi from '../../services/riderApi';

const formatCurrency = (paise) => `₹${((paise || 0) / 100).toFixed(0)}`;
const formatRating = (r) => r ? r.toFixed(1) : '—';

export default function RiderDashboardPage() {
  const dispatch = useDispatch();
  const { riderProfile } = useSelector((state) => state.riderAuth);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const { data } = await riderApi.get('/dashboard/overview');
      setOverview(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverview(); }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await dispatch(toggleRiderAvailability()).unwrap();
      if (res && res.isOnline !== undefined) {
        setOverview(prev => prev ? ({ ...prev, isOnline: res.isOnline }) : prev);
      }
    } catch (err) {
      console.warn('Availability toggle failed:', err);
    } finally {
      setToggling(false);
      fetchOverview();
    }
  };

  const stats = overview ? [
    {
      label: "Today's Deliveries",
      value: overview.todayDeliveries ?? 0,
      icon: Package,
      color: 'orange',
      suffix: ''
    },
    {
      label: 'Total Deliveries',
      value: overview.totalDeliveries ?? 0,
      icon: CheckCircle2,
      color: 'green',
      suffix: ''
    },
    {
      label: "Today's Earnings",
      value: formatCurrency(overview.todayEarnings ?? 0),
      icon: IndianRupee,
      color: 'blue',
      suffix: ''
    },
    {
      label: 'Total Earnings',
      value: formatCurrency(overview.totalEarnings ?? 0),
      icon: TrendingUp,
      color: 'purple',
      suffix: ''
    },
    {
      label: 'Average Rating',
      value: formatRating(overview.avgRating),
      icon: Star,
      color: 'yellow',
      suffix: '/5'
    },
    {
      label: 'Completion Rate',
      value: overview.completionRate ? `${overview.completionRate.toFixed(0)}%` : '—',
      icon: CheckCircle2,
      color: 'green',
      suffix: ''
    },
  ] : [];

  const isOnline = riderProfile?.isOnline ?? overview?.isOnline ?? true;

  if (loading) {
    return (
      <div>
        <div className="rider-stats-grid" style={{ marginBottom: '24px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rider-stat-card">
              <div className="rider-skeleton" style={{ width: '44px', height: '44px', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div className="rider-skeleton" style={{ height: '12px', width: '80%', marginBottom: '8px' }} />
                <div className="rider-skeleton" style={{ height: '24px', width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rider-alert rider-alert-error" style={{ marginBottom: '24px' }}>
        <AlertCircle size={16} />
        <span>{error}</span>
        <button onClick={fetchOverview} className="rider-btn rider-btn-outline rider-btn-sm" style={{ marginLeft: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Active Delivery Banner */}
      {overview?.hasActiveDelivery && (
        <div style={{
          background: 'var(--rider-primary)', borderRadius: '12px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Navigation size={20} />
            <div>
              <div style={{ fontWeight: 700 }}>Active Delivery in Progress</div>
              <div style={{ fontSize: '13px', opacity: 0.85 }}>
                {overview.activeDelivery?.orderNumber || 'Order'} — tap to continue
              </div>
            </div>
          </div>
          <Link
            to="/rider/delivery/active"
            style={{
              background: 'white', color: 'var(--rider-primary)', borderRadius: '8px',
              padding: '8px 14px', fontWeight: 600, fontSize: '13px', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            Continue <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Online / Offline Toggle */}
      <div
        className="rider-card"
        style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '4px' }}>
            {isOnline ? '🟢 You are Online' : '⚫ You are Offline'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>
            {isOnline ? 'You will receive new delivery requests' : 'Go online to start receiving orders'}
          </div>
        </div>
        <label className="rider-toggle-switch" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isOnline}
            onChange={handleToggle}
            disabled={toggling}
          />
          <span className="rider-toggle-slider" />
        </label>
      </div>

      {/* Stats Grid */}
      <div className="rider-stats-grid" style={{ marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} className="rider-stat-card">
            <div className={`rider-stat-icon ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="rider-stat-info">
              <div className="rider-stat-label">{s.label}</div>
              <div className="rider-stat-value">{s.value}{s.suffix}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Weekly Earnings Chart */}
        {overview?.weeklyEarnings && overview.weeklyEarnings.length > 0 && (
          <div className="rider-card">
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
              Weekly Earnings
            </div>
            <div className="rider-chart-container" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.weeklyEarnings.map(d => ({
                  day: d.day || d.date,
                  earnings: Math.round((d.earnings || d.amount || 0) / 100)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716C' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#78716C' }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={(v) => [`₹${v}`, 'Earnings']} />
                  <Bar dataKey="earnings" fill="#F97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="rider-card">
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
            Quick Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Pending Deliveries', value: overview?.pendingDeliveries ?? 0 },
              { label: 'Completed Today', value: overview?.completedToday ?? 0 },
              { label: 'Avg Rating', value: formatRating(overview?.avgRating) + ' ★' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--rider-border)' : 'none'
              }}>
                <span style={{ fontSize: '14px', color: 'var(--rider-text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--rider-text)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      {overview?.recentDeliveries && overview.recentDeliveries.length > 0 && (
        <div className="rider-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)' }}>Recent Deliveries</div>
            <Link to="/rider/history" style={{ fontSize: '13px', color: 'var(--rider-primary)', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          <div className="rider-table-wrap">
            <table className="rider-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Restaurant</th>
                  <th>Earnings</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentDeliveries.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--rider-primary)' }}>
                      {d.orderNumber || `#${String(i + 1).padStart(4, '0')}`}
                    </td>
                    <td>{d.restaurant?.name || d.restaurantName || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(d.deliveryFee || d.earnings || 0)}</td>
                    <td>
                      <span className={`rider-pill ${d.status === 'delivered' ? 'rider-pill-success' : d.status === 'cancelled' ? 'rider-pill-error' : 'rider-pill-orange'}`}>
                        {d.status || 'completed'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--rider-text-secondary)', fontSize: '12px' }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!overview?.recentDeliveries?.length && (
        <div className="rider-card">
          <div className="rider-empty-state">
            <div className="rider-empty-state-icon">
              <Clock size={28} />
            </div>
            <div className="rider-empty-state-title">No deliveries yet</div>
            <div className="rider-empty-state-desc">Go online and start accepting delivery requests!</div>
          </div>
        </div>
      )}
    </div>
  );
}

