import React, { useState } from 'react';
import { Eye, EyeOff, Lock, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleRiderAvailability } from '../../features/rider/riderAuthSlice';
import riderApi from '../../services/riderApi';

export default function RiderSettingsPage() {
  const dispatch = useDispatch();
  const { riderProfile } = useSelector((state) => state.riderAuth);
  const isOnline = riderProfile?.isOnline ?? false;

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass.length < 6) { setPassError('Password must be at least 6 characters'); return; }
    if (passwords.newPass !== passwords.confirm) { setPassError('Passwords do not match'); return; }
    setPassLoading(true);
    setPassError('');
    try {
      await riderApi.put('/auth/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      });
      setPassSuccess('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPassSuccess(''), 3000);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const toggleOnline = () => dispatch(toggleRiderAvailability());

  const PasswordInput = ({ label, field }) => (
    <div className="rider-form-group">
      <label className="rider-form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--rider-text-secondary)' }} />
        <input
          type={showPass[field] ? 'text' : 'password'}
          className="rider-form-input"
          style={{ paddingLeft: '36px', paddingRight: '36px' }}
          value={passwords[field]}
          onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
          placeholder={label}
        />
        <button type="button" onClick={() => setShowPass(s => ({ ...s, [field]: !s[field] }))}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rider-text-secondary)' }}>
          {showPass[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="rider-page-header">
        <div>
          <div className="rider-page-title">Settings</div>
          <div className="rider-page-subtitle">Manage preferences and security</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        {/* Availability */}
        <div className="rider-card">
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
            Availability
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--rider-text)', marginBottom: '4px' }}>
                {isOnline ? '🟢 Currently Online' : '⚫ Currently Offline'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>
                {isOnline ? 'You are receiving delivery requests' : 'Toggle to start receiving requests'}
              </div>
            </div>
            <label className="rider-toggle-switch" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={isOnline} onChange={toggleOnline} />
              <span className="rider-toggle-slider" />
            </label>
          </div>
        </div>

        {/* Change Password */}
        <div className="rider-card">
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
            Change Password
          </div>

          {passSuccess && (
            <div className="rider-alert rider-alert-success" style={{ marginBottom: '16px' }}>
              <CheckCircle size={15} /> <span>{passSuccess}</span>
            </div>
          )}
          {passError && (
            <div className="rider-alert rider-alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={15} /> <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <PasswordInput label="Current Password" field="current" />
            <PasswordInput label="New Password" field="newPass" />
            <PasswordInput label="Confirm New Password" field="confirm" />
            <button type="submit" className="rider-btn rider-btn-primary" disabled={passLoading}>
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Support Info */}
        <div className="rider-card">
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--rider-text)', marginBottom: '16px' }}>
            Support
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: Phone, label: 'Rider Support Hotline', value: '+91 1800 123 4567' },
              { icon: MapPin, label: 'Support Email', value: 'rider-support@fooddelight.com' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--rider-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rider-primary)', flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

