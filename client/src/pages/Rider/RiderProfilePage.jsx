import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Bike, Star, Edit2, Save, X,
  CheckCircle, AlertCircle, Building2
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setRiderProfile } from '../../features/rider/riderAuthSlice';
import riderApi from '../../services/riderApi';

const VEHICLE_TYPES = ['Motorcycle', 'Scooter', 'Bicycle', 'Electric Scooter', 'Car'];

export default function RiderProfilePage() {
  const dispatch = useDispatch();
  const { user, riderProfile } = useSelector((state) => state.riderAuth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await riderApi.get('/profile');
        setProfile(data.data);
        dispatch(setRiderProfile(data.data));
        const p = data.data;
        setForm({
          vehicleType: p.vehicleType || 'Motorcycle',
          vehicleNumber: p.vehicleNumber || '',
          licenseNumber: p.licenseNumber || '',
          preferredArea: p.preferredArea || '',
          bankAccountHolderName: p.bankDetails?.accountHolderName || '',
          bankAccountNumber: p.bankDetails?.accountNumber || '',
          bankIfscCode: p.bankDetails?.ifscCode || '',
          bankName: p.bankDetails?.bankName || '',
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dispatch]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await riderApi.put('/profile', {
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber,
        licenseNumber: form.licenseNumber,
        preferredArea: form.preferredArea,
      });
      // Update bank details
      await riderApi.put('/profile/bank', {
        accountHolderName: form.bankAccountHolderName,
        accountNumber: form.bankAccountNumber,
        ifscCode: form.bankIfscCode,
        bankName: form.bankName,
      });
      setProfile(data.data);
      dispatch(setRiderProfile(data.data));
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'approved') return 'rider-pill-success';
    if (status === 'rejected') return 'rider-pill-error';
    return 'rider-pill-warning';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[1,2,3].map(i => (
          <div key={i} className="rider-card">
            <div className="rider-skeleton" style={{ height: '20px', width: '30%', marginBottom: '16px' }} />
            <div className="rider-skeleton" style={{ height: '14px', width: '80%', marginBottom: '8px' }} />
            <div className="rider-skeleton" style={{ height: '14px', width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'R';

  return (
    <div>
      <div className="rider-page-header">
        <div>
          <div className="rider-page-title">My Profile</div>
          <div className="rider-page-subtitle">Manage your personal and vehicle information</div>
        </div>
        {!editing ? (
          <button className="rider-btn rider-btn-secondary" onClick={() => setEditing(true)}>
            <Edit2 size={15} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="rider-btn rider-btn-outline" onClick={() => setEditing(false)}>
              <X size={15} /> Cancel
            </button>
            <button className="rider-btn rider-btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rider-alert rider-alert-error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rider-alert rider-alert-success" style={{ marginBottom: '16px' }}>
          <CheckCircle size={15} /> <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Left: Avatar + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="rider-card" style={{ textAlign: 'center' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }} />
            ) : (
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: 'var(--rider-primary)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: 700, margin: '0 auto 12px'
              }}>
                {initials}
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--rider-text)', marginBottom: '4px' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--rider-text-secondary)', marginBottom: '12px' }}>
              Delivery Partner
            </div>
            <span className={`rider-pill ${getStatusClass(profile?.verificationStatus)}`}>
              {profile?.verificationStatus === 'approved' ? '✓ Verified' : profile?.verificationStatus || 'pending'}
            </span>
          </div>

          {/* Performance */}
          <div className="rider-card">
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--rider-text)', marginBottom: '14px' }}>
              Performance
            </div>
            {[
              { label: 'Rating', value: `${(profile?.rating || 0).toFixed(1)} ★`, color: 'var(--rider-warning)' },
              { label: 'Total Deliveries', value: profile?.totalDeliveries ?? 0 },
              { label: 'Completion Rate', value: `${(profile?.completionRate || 0).toFixed(0)}%` },
              { label: 'Total Ratings', value: profile?.totalRatings ?? 0 },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid var(--rider-border)'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--rider-text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: color || 'var(--rider-text)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Personal Info */}
          <div className="rider-card">
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--rider-text)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <User size={16} style={{ color: 'var(--rider-primary)' }} /> Personal Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)', marginBottom: '4px' }}>Full Name</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <User size={13} style={{ color: 'var(--rider-text-secondary)' }} /> {user?.name || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Mail size={13} style={{ color: 'var(--rider-text-secondary)' }} /> {user?.email || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)', marginBottom: '4px' }}>Phone</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Phone size={13} style={{ color: 'var(--rider-text-secondary)' }} /> {user?.phone || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="rider-card">
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--rider-text)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Bike size={16} style={{ color: 'var(--rider-primary)' }} /> Vehicle & License
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="rider-form-group" style={{ marginBottom: 0 }}>
                <label className="rider-form-label">Vehicle Type</label>
                {editing ? (
                  <select
                    className="rider-form-select"
                    value={form.vehicleType}
                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                  >
                    {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                  </select>
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', marginTop: '4px' }}>{profile?.vehicleType || '—'}</div>
                )}
              </div>
              <div className="rider-form-group" style={{ marginBottom: 0 }}>
                <label className="rider-form-label">Vehicle Number</label>
                {editing ? (
                  <input className="rider-form-input" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', marginTop: '4px' }}>{profile?.vehicleNumber || '—'}</div>
                )}
              </div>
              <div className="rider-form-group" style={{ marginBottom: 0 }}>
                <label className="rider-form-label">License Number</label>
                {editing ? (
                  <input className="rider-form-input" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', marginTop: '4px' }}>{profile?.licenseNumber || '—'}</div>
                )}
              </div>
              <div className="rider-form-group" style={{ marginBottom: 0 }}>
                <label className="rider-form-label">Preferred Area</label>
                {editing ? (
                  <input className="rider-form-input" value={form.preferredArea} onChange={(e) => setForm({ ...form, preferredArea: e.target.value })} />
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', marginTop: '4px' }}>{profile?.preferredArea || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="rider-card">
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--rider-text)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Building2 size={16} style={{ color: 'var(--rider-primary)' }} /> Bank Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Account Holder', field: 'bankAccountHolderName', display: profile?.bankDetails?.accountHolderName },
                { label: 'Account Number', field: 'bankAccountNumber', display: profile?.bankDetails?.accountNumber ? '••••••' + profile.bankDetails.accountNumber.slice(-4) : '—' },
                { label: 'IFSC Code', field: 'bankIfscCode', display: profile?.bankDetails?.ifscCode },
                { label: 'Bank Name', field: 'bankName', display: profile?.bankDetails?.bankName },
              ].map(({ label, field, display }) => (
                <div key={field} className="rider-form-group" style={{ marginBottom: 0 }}>
                  <label className="rider-form-label">{label}</label>
                  {editing ? (
                    <input className="rider-form-input" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
                  ) : (
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--rider-text)', marginTop: '4px' }}>{display || '—'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

