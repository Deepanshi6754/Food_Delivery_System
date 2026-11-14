import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, MapPin, Package, User, Phone,
  Navigation, AlertCircle, Loader, KeyRound, ExternalLink
} from 'lucide-react';
import riderApi from '../../services/riderApi';

const STAGES = [
  { key: 'assigned', label: 'Order Assigned', desc: 'Head to the restaurant for pickup' },
  { key: 'reached_restaurant', label: 'Reached Restaurant', desc: 'Confirm you have arrived at the kitchen', action: 'Mark Arrived at Kitchen' },
  { key: 'picked_up', label: 'Order Picked Up', desc: 'Confirm you have collected the order', action: 'Confirm Order Collected' },
  { key: 'reached_customer', label: 'Reached Customer', desc: 'Confirm you are at the delivery location', action: 'Arrived at Doorstep' },
  { key: 'delivered', label: 'Order Delivered', desc: 'Enter OTP to confirm successful delivery', action: 'Confirm Delivery with OTP' },
];

const STAGE_ORDER = ['assigned', 'reached_restaurant', 'picked_up', 'reached_customer', 'delivered'];

export default function RiderActiveDeliveryPage() {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const locationInterval = useRef(null);

  const fetchActive = async () => {
    try {
      const { data } = await riderApi.get('/deliveries/active');
      if (data?.data) {
        setDelivery(data.data);
      } else {
        navigate('/rider/deliveries', { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/rider/deliveries', { replace: true });
      } else {
        setError('Failed to load active delivery');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActive(); }, []);

  // GPS location update every 30s
  useEffect(() => {
    if (!delivery) return;
    const updateLocation = () => {
      navigator.geolocation?.getCurrentPosition(({ coords }) => {
        riderApi.post('/location', {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy
        }).catch(() => {});
      });
    };
    updateLocation();
    locationInterval.current = setInterval(updateLocation, 30000);
    return () => clearInterval(locationInterval.current);
  }, [delivery]);

  const currentStageIndex = delivery?.rider?.stage
    ? STAGE_ORDER.indexOf(delivery.rider.stage)
    : (delivery?.status === 'out_for_delivery' ? 0 : -1);

  const handleStageUpdate = async (stage) => {
    if (stage === 'delivered') {
      setShowOtpModal(true);
      return;
    }
    setUpdating(true);
    setError('');
    try {
      await riderApi.put('/deliveries/active/stage', { stage });
      await fetchActive();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliveryConfirm = async () => {
    if (!otp.trim() || otp.length < 4) {
      setOtpError('Please enter the 4-digit OTP');
      return;
    }
    setUpdating(true);
    setOtpError('');
    try {
      await riderApi.put('/deliveries/active/stage', { stage: 'delivered', otp });
      setShowOtpModal(false);
      navigate('/rider/history', { replace: true });
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStage = () => {
    const stagesWithAction = ['reached_restaurant', 'picked_up', 'reached_customer', 'delivered'];
    const currentStage = delivery?.rider?.stage || 'assigned';
    const currentIdx = STAGE_ORDER.indexOf(currentStage);
    if (currentIdx < 0 || currentIdx >= STAGE_ORDER.length - 1) return null;
    const nextStage = STAGE_ORDER[currentIdx + 1];
    if (stagesWithAction.includes(nextStage)) return nextStage;
    return null;
  };

  const nextStage = getNextStage();
  const nextStageInfo = nextStage ? STAGES.find(s => s.key === nextStage) : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px', flexDirection: 'column', gap: '16px' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--rider-primary)' }} />
        <div style={{ color: 'var(--rider-text-secondary)' }}>Loading active delivery...</div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="rider-card">
        <div className="rider-empty-state">
          <div className="rider-empty-state-icon"><Package size={28} /></div>
          <div className="rider-empty-state-title">No Active Delivery</div>
          <div className="rider-empty-state-desc">You don't have any delivery in progress.</div>
        </div>
      </div>
    );
  }

  const restaurant = delivery.restaurant || {};
  const address = delivery.deliveryAddress || {};
  const customer = delivery.customer || {};
  const currentStageKey = delivery.rider?.stage || 'assigned';

  return (
    <div>
      {error && (
        <div className="rider-alert rider-alert-error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: Stage Timeline */}
        <div>
          <div className="rider-card" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
              Delivery Progress
            </div>

            <div className="delivery-stage-timeline">
              {STAGES.map((stage, i) => {
                const stageIdx = STAGE_ORDER.indexOf(stage.key);
                const isCompleted = stageIdx < currentStageIndex;
                const isActive = stage.key === currentStageKey;
                const isPending = stageIdx > currentStageIndex;

                return (
                  <div
                    key={stage.key}
                    className={`delivery-stage-step ${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`}
                  >
                    <div className="delivery-stage-indicator">
                      {isCompleted ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <div className="delivery-stage-content">
                      <div className="delivery-stage-title">{stage.label}</div>
                      <div className="delivery-stage-desc">{stage.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          {nextStageInfo && (
            <button
              className="rider-btn rider-btn-primary rider-btn-full rider-btn-lg"
              onClick={() => handleStageUpdate(nextStage)}
              disabled={updating}
              style={{ marginBottom: '12px' }}
            >
              {updating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Updating...
                </span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {nextStageInfo.action}
                </>
              )}
            </button>
          )}

          {currentStageKey === 'delivered' && (
            <div className="rider-alert rider-alert-success">
              <CheckCircle2 size={16} />
              <span>Delivery completed successfully! 🎉</span>
            </div>
          )}
        </div>

        {/* Right: Order Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Order Details */}
          <div className="rider-card">
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--rider-text)', marginBottom: '12px' }}>
              Order #{delivery.orderNumber}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {delivery.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--rider-text)' }}>{item.name || item.menuItem?.name}</span>
                  <span style={{ color: 'var(--rider-text-secondary)' }}>×{item.quantity}</span>
                </div>
              ))}
            </div>
            {delivery.specialInstructions && (
              <div style={{
                marginTop: '10px', padding: '8px 10px', background: 'var(--rider-primary-light)',
                borderRadius: '6px', fontSize: '12px', color: '#9A3412'
              }}>
                📝 {delivery.specialInstructions}
              </div>
            )}
          </div>

          {/* Restaurant */}
          <div className="rider-card">
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--rider-text-secondary)', marginBottom: '10px' }}>
              PICKUP — RESTAURANT
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <MapPin size={16} style={{ color: 'var(--rider-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--rider-text)', marginBottom: '2px' }}>{restaurant.name || 'Restaurant'}</div>
                <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>
                  {restaurant.address?.street || restaurant.address || '—'}
                </div>
              </div>
            </div>
            {restaurant.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' restaurant')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rider-btn rider-btn-outline rider-btn-sm rider-btn-full"
              >
                <ExternalLink size={14} /> Open in Maps
              </a>
            )}
          </div>

          {/* Customer */}
          <div className="rider-card">
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--rider-text-secondary)', marginBottom: '10px' }}>
              DELIVERY — CUSTOMER
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <MapPin size={16} style={{ color: '#1D4ED8', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--rider-text)', marginBottom: '2px' }}>
                  {customer.name || 'Customer'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>
                  {address.street || address.fullAddress || '—'}{address.area ? `, ${address.area}` : ''}
                </div>
              </div>
            </div>
            {address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([address.street, address.area, address.city].filter(Boolean).join(', '))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rider-btn rider-btn-outline rider-btn-sm rider-btn-full"
              >
                <ExternalLink size={14} /> Open in Maps
              </a>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="rider-modal-overlay">
          <div className="rider-modal">
            <div className="rider-modal-header">
              <div className="rider-modal-title">Confirm Delivery</div>
              <button className="rider-modal-close" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpError(''); }}>✕</button>
            </div>
            <div className="rider-modal-body">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--rider-primary-light)', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rider-primary)'
                }}>
                  <KeyRound size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--rider-text)', marginBottom: '6px' }}>
                  Enter Delivery OTP
                </div>
                <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>
                  Ask the customer for the 4-digit OTP to confirm delivery
                </div>
              </div>

              <div className="rider-form-group">
                <label className="rider-form-label">OTP from Customer <span>*</span></label>
                <input
                  type="text"
                  className={`rider-form-input ${otpError ? 'error' : ''}`}
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  style={{ fontSize: '20px', letterSpacing: '8px', textAlign: 'center' }}
                />
                {otpError && <div className="rider-form-error">{otpError}</div>}
              </div>
            </div>
            <div className="rider-modal-footer">
              <button className="rider-btn rider-btn-outline" onClick={() => { setShowOtpModal(false); setOtp(''); setOtpError(''); }}>
                Cancel
              </button>
              <button
                className="rider-btn rider-btn-success"
                onClick={handleDeliveryConfirm}
                disabled={updating}
              >
                {updating ? 'Verifying...' : '✓ Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

