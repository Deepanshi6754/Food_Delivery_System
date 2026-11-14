import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Settings,
  Lock,
  Power,
  Shield,
  Bell,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ownerApi from '../../services/ownerApi';
import { toggleRestaurantStatus } from '../../features/owner/ownerAuthSlice';

export default function OwnerSettingsPage() {
  const dispatch = useDispatch();
  const { restaurant } = useSelector((state) => state.ownerAuth);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const isStoreOpen = restaurant?.isOpen && !restaurant?.isTemporarilyClosed;

  const handleToggleStore = () => {
    dispatch(
      toggleRestaurantStatus({
        isOpen: !isStoreOpen,
        isTemporarilyClosed: false
      })
    );
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setSavingPass(true);
      await ownerApi.put('/auth/password', {
        currentPassword,
        newPassword
      });
      setPasswordMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Store Controls & Account Security</h1>
          <p>Manage store online status, update login credentials, and notification settings.</p>
        </div>
      </div>

      {/* Operational Status Card */}
      <div className="owner-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800 }}>
          Kitchen Online Availability
        </h3>
        <p style={{ margin: '0 0 1.25rem 0', color: '#78716C', fontSize: '0.9rem' }}>
          When store availability is paused, your restaurant will appear as "Temporarily Closed" on customer search and will not receive new incoming orders.
        </p>

        <div
          style={{
            background: isStoreOpen ? '#DCFCE7' : '#FEE2E2',
            border: `1px solid ${isStoreOpen ? '#BBF7D0' : '#FECACA'}`,
            padding: '1.25rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                color: isStoreOpen ? '#15803D' : '#DC2626',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Power size={18} />
              <span>{isStoreOpen ? 'Store is Online & Taking Orders' : 'Store is Temporarily Paused'}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78716C', marginTop: '0.25rem' }}>
              {isStoreOpen
                ? 'Customers can browse menu and checkout.'
                : 'Customer checkout is currently blocked.'}
            </div>
          </div>

          <button
            onClick={handleToggleStore}
            className="owner-btn-primary"
            style={{
              background: isStoreOpen ? '#DC2626' : '#15803D'
            }}
          >
            <span>{isStoreOpen ? 'Pause Store' : 'Resume Store'}</span>
          </button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="owner-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800 }}>
          Security & Password Change
        </h3>
        <p style={{ margin: '0 0 1.25rem 0', color: '#78716C', fontSize: '0.9rem' }}>
          Update your partner login password to maintain account security.
        </p>

        {passwordMsg && (
          <div style={{ background: '#DCFCE7', color: '#15803D', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{passwordMsg}</span>
          </div>
        )}

        {passwordError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="owner-form-group">
            <label>Current Password *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="owner-form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>New Password (min 6 characters) *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="owner-form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={savingPass} className="owner-btn-primary" style={{ marginTop: '0.5rem' }}>
            <Save size={16} />
            <span>{savingPass ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Partner Support Info */}
      <div className="owner-card">
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800 }}>
          FoodDelight Partner Care
        </h3>
        <p style={{ margin: '0 0 1rem 0', color: '#78716C', fontSize: '0.9rem' }}>
          Need assistance with kitchen tablet configuration, menu photography, or payout banking details? Contact dedicated partner relations:
        </p>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
          <div>
            <strong>Email:</strong> <span style={{ color: '#F97316' }}>partners@fooddelight.com</span>
          </div>
          <div>
            <strong>Helpline:</strong> <span style={{ color: '#F97316' }}>1800-FOOD-PARTNER</span>
          </div>
        </div>
      </div>
    </div>
  );
}

