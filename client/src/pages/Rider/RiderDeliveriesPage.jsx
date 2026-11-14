import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, MapPin, IndianRupee, Clock, CheckCircle, XCircle,
  RefreshCw, Navigation, AlertCircle, Zap
} from 'lucide-react';
import riderApi from '../../services/riderApi';
import { useSelector } from 'react-redux';

const formatCurrency = (paise) => `₹${((paise || 0) / 100).toFixed(0)}`;

function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  
  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const isUrgent = remaining <= 15;
  return (
    <span className={`delivery-request-timer ${isUrgent ? 'urgent' : 'normal'}`}>
      <Clock size={12} />
      {remaining}s
    </span>
  );
}

export default function RiderDeliveriesPage() {
  const { riderProfile } = useSelector((state) => state.riderAuth);
  const isOnline = riderProfile?.isOnline ?? false;

  const [requests, setRequests] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, activeRes] = await Promise.allSettled([
        riderApi.get('/deliveries/requests'),
        riderApi.get('/deliveries/active')
      ]);

      if (reqRes.status === 'fulfilled') {
        setRequests(reqRes.value.data?.data || []);
      }
      if (activeRes.status === 'fulfilled') {
        setActiveDelivery(activeRes.value.data?.data || null);
      } else {
        setActiveDelivery(null);
      }
      setLastRefresh(new Date());
      setError('');
    } catch (err) {
      setError('Failed to fetch delivery data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll every 15 seconds when online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [isOnline, fetchData]);

  const handleAccept = async (assignmentId) => {
    setActionLoading(prev => ({ ...prev, [assignmentId]: 'accept' }));
    try {
      await riderApi.post(`/deliveries/${assignmentId}/accept`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setActionLoading(prev => ({ ...prev, [assignmentId]: null }));
    }
  };

  const handleReject = async (assignmentId) => {
    setActionLoading(prev => ({ ...prev, [assignmentId]: 'reject' }));
    try {
      await riderApi.post(`/deliveries/${assignmentId}/reject`);
      setRequests(prev => prev.filter(r => r._id !== assignmentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject delivery');
    } finally {
      setActionLoading(prev => ({ ...prev, [assignmentId]: null }));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="rider-page-header">
        <div>
          <div className="rider-page-title">Deliveries</div>
          <div className="rider-page-subtitle">
            {isOnline ? `🟢 Online • Last updated: ${lastRefresh.toLocaleTimeString()}` : '⚫ Go online to receive requests'}
          </div>
        </div>
        <button onClick={fetchData} className="rider-btn rider-btn-outline rider-btn-sm" disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {!isOnline && (
        <div className="rider-alert rider-alert-warning" style={{ marginBottom: '24px' }}>
          <AlertCircle size={16} />
          <span>You are currently offline. Go to your dashboard and toggle online to receive delivery requests.</span>
        </div>
      )}

      {/* Active Delivery */}
      {activeDelivery && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rider-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Active Delivery
          </div>
          <div className="rider-card" style={{ borderColor: 'var(--rider-primary)', borderWidth: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'var(--rider-primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--rider-primary)'
                }}>
                  <Navigation size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)' }}>
                    {activeDelivery.orderNumber || 'Active Order'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>
                    Stage: {activeDelivery.stage || activeDelivery.rider?.stage || 'in_progress'}
                  </div>
                </div>
              </div>
              <Link to="/rider/delivery/active" className="rider-btn rider-btn-primary rider-btn-sm">
                Continue Delivery →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Requests */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rider-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          Incoming Requests ({requests.length})
        </div>

        {loading && !requests.length && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2].map(i => (
              <div key={i} className="rider-card">
                <div className="rider-skeleton" style={{ height: '20px', width: '60%', marginBottom: '10px' }} />
                <div className="rider-skeleton" style={{ height: '14px', width: '80%', marginBottom: '6px' }} />
                <div className="rider-skeleton" style={{ height: '14px', width: '50%' }} />
              </div>
            ))}
          </div>
        )}

        {!loading && !requests.length && (
          <div className="rider-card">
            <div className="rider-empty-state">
              <div className="rider-empty-state-icon">
                <Package size={28} />
              </div>
              <div className="rider-empty-state-title">No delivery requests</div>
              <div className="rider-empty-state-desc">
                {isOnline ? 'Waiting for new orders... refreshes every 15 seconds.' : 'Go online to start receiving requests.'}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((req) => (
            <div
              key={req._id}
              className={`delivery-request-card ${actionLoading[req._id] ? 'urgent' : ''}`}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '2px' }}>
                    {req.order?.orderNumber || req.orderNumber || 'New Request'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)' }}>
                    {req.order?.items?.length || 0} items
                  </div>
                </div>
                <CountdownTimer
                  seconds={Math.max(0, Math.floor((new Date(req.expiresAt) - Date.now()) / 1000))}
                  onExpire={() => setRequests(prev => prev.filter(r => r._id !== req._id))}
                />
              </div>

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <MapPin size={14} style={{ color: 'var(--rider-primary)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--rider-text-secondary)', marginBottom: '2px' }}>Pickup</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--rider-text)' }}>
                      {req.order?.restaurant?.name || req.restaurantName || 'Restaurant'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <MapPin size={14} style={{ color: '#1D4ED8', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--rider-text-secondary)', marginBottom: '2px' }}>Delivery</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--rider-text)' }}>
                      {req.order?.deliveryAddress?.area || req.deliveryArea || 'Customer'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <IndianRupee size={14} style={{ color: 'var(--rider-success)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--rider-text-secondary)' }}>Delivery Fee</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rider-success)' }}>
                      {formatCurrency(req.deliveryFee || 3000)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Zap size={14} style={{ color: 'var(--rider-warning)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--rider-text-secondary)' }}>Distance</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--rider-text)' }}>
                      {req.distance ? `${(req.distance / 1000).toFixed(1)} km` : '~2.5 km'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="rider-btn rider-btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => handleAccept(req._id)}
                  disabled={!!actionLoading[req._id] || !!activeDelivery}
                >
                  {actionLoading[req._id] === 'accept' ? (
                    'Accepting...'
                  ) : (
                    <><CheckCircle size={15} /> Accept</>
                  )}
                </button>
                <button
                  className="rider-btn rider-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => handleReject(req._id)}
                  disabled={!!actionLoading[req._id]}
                >
                  {actionLoading[req._id] === 'reject' ? (
                    'Rejecting...'
                  ) : (
                    <><XCircle size={15} /> Reject</>
                  )}
                </button>
              </div>

              {activeDelivery && (
                <div className="rider-alert rider-alert-warning" style={{ marginTop: '10px', fontSize: '12px' }}>
                  Complete your active delivery before accepting a new one.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

