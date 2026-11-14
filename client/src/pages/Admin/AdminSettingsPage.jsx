import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import adminApi from '../../services/adminApi';
import {
  Settings,
  Save,
  ShieldCheck,
  AlertTriangle,
  Building,
  DollarSign,
  Truck,
  CheckCircle2
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { admin } = useSelector((state) => state.adminAuth);
  const isSuperAdmin = admin?.adminRole === 'super_admin';

  const [settings, setSettings] = useState({
    platformName: 'FoodDelight',
    platformTagline: 'Premium Culinary Delivery Network',
    supportEmail: 'support@fooddelight.com',
    supportPhone: '+91 1800 123 4567',
    defaultCommissionRate: 15,
    deliveryFeeBase: 39,
    deliveryFeePerKm: 10,
    taxRate: 5,
    minOrderAmount: 99,
    freeDeliveryThreshold: 499,
    maintenanceMode: false,
    maintenanceMessage: 'FoodDelight is currently undergoing scheduled platform upgrades.',
    serviceableCities: ['Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Mumbai']
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminApi.get('/settings');
        if (res.data.success && res.data.data) {
          const s = res.data.data;
          setSettings({
            platformName: s.platformName || 'FoodDelight',
            platformTagline: s.platformTagline || '',
            supportEmail: s.supportEmail || '',
            supportPhone: s.supportPhone || '',
            defaultCommissionRate: s.defaultCommissionRate || 15,
            deliveryFeeBase: (s.deliveryFeeBase || 3900) / 100,
            deliveryFeePerKm: (s.deliveryFeePerKm || 1000) / 100,
            taxRate: s.taxRate || 5,
            minOrderAmount: (s.minOrderAmount || 9900) / 100,
            freeDeliveryThreshold: (s.freeDeliveryThreshold || 49900) / 100,
            maintenanceMode: Boolean(s.maintenanceMode),
            maintenanceMessage: s.maintenanceMessage || '',
            serviceableCities: s.serviceableCities || []
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Only Super Administrators have permission to modify platform settings.');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        ...settings,
        deliveryFeeBase: Math.round(Number(settings.deliveryFeeBase) * 100),
        deliveryFeePerKm: Math.round(Number(settings.deliveryFeePerKm) * 100),
        minOrderAmount: Math.round(Number(settings.minOrderAmount) * 100),
        freeDeliveryThreshold: Math.round(Number(settings.freeDeliveryThreshold) * 100)
      };

      const res = await adminApi.put('/settings', payload);
      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update platform settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCity = () => {
    if (newCity.trim() && !settings.serviceableCities.includes(newCity.trim())) {
      setSettings({
        ...settings,
        serviceableCities: [...settings.serviceableCities, newCity.trim()]
      });
      setNewCity('');
    }
  };

  const handleRemoveCity = (city) => {
    setSettings({
      ...settings,
      serviceableCities: settings.serviceableCities.filter((c) => c !== city)
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#78716C' }}>
        Loading platform parameters...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Configuration & Controls</h1>
          <p className="admin-page-subtitle">
            Global commission percentages, dynamic delivery fee pricing formulas, tax brackets, and emergency switches
          </p>
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={saving}
            onClick={handleSave}
          >
            <Save size={16} />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        )}
      </div>

      {saveSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: '#DCFCE7',
            color: '#15803D',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            border: '1px solid #86EFAC'
          }}
        >
          <CheckCircle2 size={18} />
          <span>Platform settings updated successfully and logged to the security audit trail!</span>
        </div>
      )}

      {!isSuperAdmin && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: '#FEF3C7',
            color: '#D97706',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            border: '1px solid #FCD34D'
          }}
        >
          <AlertTriangle size={18} />
          <span>
            You are logged in as {admin?.adminRole}. Only <strong>Super Administrators</strong> have authorization to edit global parameters.
          </span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Section 1: Financial & Commercial Rules */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} color="#F97316" />
                <h3 className="admin-card-title">Commercial & Fee Parameters</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Default Vendor Commission (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.defaultCommissionRate}
                  onChange={(e) => setSettings({ ...settings, defaultCommissionRate: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Standard GST Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Base Delivery Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.deliveryFeeBase}
                  onChange={(e) => setSettings({ ...settings, deliveryFeeBase: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Distance Rate per KM (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.deliveryFeePerKm}
                  onChange={(e) => setSettings({ ...settings, deliveryFeePerKm: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Min Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.minOrderAmount}
                  onChange={(e) => setSettings({ ...settings, minOrderAmount: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.freeDeliveryThreshold}
                  onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Platform Identity */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} color="#F97316" />
                <h3 className="admin-card-title">Brand Identity & Support</h3>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Platform Brand Name</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                className="admin-form-control"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Platform Tagline</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                className="admin-form-control"
                value={settings.platformTagline}
                onChange={(e) => setSettings({ ...settings, platformTagline: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Support Email</label>
                <input
                  type="email"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Support Hotline</label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  className="admin-form-control"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Serviceable Cities */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} color="#F97316" />
                <h3 className="admin-card-title">Serviceable Operational Cities</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {settings.serviceableCities.map((city) => (
                <span
                  key={city}
                  className="admin-badge admin-badge-info"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                >
                  {city}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', marginLeft: '0.4rem', cursor: 'pointer', color: '#0369A1' }}
                      onClick={() => handleRemoveCity(city)}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isSuperAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Add new serviceable city..."
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleAddCity}
                >
                  Add City
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Emergency Maintenance Mode */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h3 className="admin-card-title">Emergency Maintenance Switch</h3>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: settings.maintenanceMode ? '#FEE2E2' : '#FAFAF9',
                border: settings.maintenanceMode ? '1px solid #FCA5A5' : '1px solid #E7E5E4',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: settings.maintenanceMode ? '#DC2626' : '#292524' }}>
                  Maintenance Mode: {settings.maintenanceMode ? 'ENABLED (Platform Offline)' : 'Disabled (Operational)'}
                </strong>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#78716C' }}>
                  When enabled, consumer ordering is temporarily paused.
                </span>
              </div>
              {isSuperAdmin && (
                <input
                  type="checkbox"
                  style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                />
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Maintenance Banner Message</label>
              <textarea
                rows="2"
                disabled={!isSuperAdmin}
                className="admin-form-control"
                value={settings.maintenanceMessage}
                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
