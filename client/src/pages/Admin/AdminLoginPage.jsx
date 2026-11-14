import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginAdmin } from '../../features/admin/adminAuthSlice';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import '../../styles/admin.css';

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.adminAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginAdmin({ email, password }));
    if (!result.error) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    dispatch(loginAdmin({ email: demoEmail, password: demoPassword })).then((res) => {
      if (!res.error) {
        navigate(from, { replace: true });
      }
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEDD5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 20px 40px rgba(41, 37, 36, 0.08)',
          border: '1px solid #E7E5E4'
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 1rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)'
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#292524', margin: 0 }}>
            FoodDelight Admin
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#78716C', marginTop: '0.35rem' }}>
            System Administration & Control Center
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              border: '1px solid #FCA5A5'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#78716C"
                style={{ position: 'absolute', left: '12px', top: '12px' }}
              />
              <input
                type="email"
                required
                className="admin-form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="admin@fooddelight.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Master Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#78716C"
                style={{ position: 'absolute', left: '12px', top: '12px' }}
              />
              <input
                type="password"
                required
                className="admin-form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Quick Demo Login */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E7E5E4' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#78716C',
              marginBottom: '0.75rem'
            }}
          >
            <Sparkles size={14} color="#F97316" />
            <span>1-Click Demo Profiles</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => handleQuickLogin('admin@fooddelight.com', 'admin123')}
            >
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem' }}>Super Admin</strong>
                <span style={{ fontSize: '0.7rem', color: '#78716C' }}>admin@fooddelight.com</span>
              </div>
              <span className="admin-badge admin-badge-success">Full Access</span>
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => handleQuickLogin('ops@fooddelight.com', 'admin123')}
            >
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem' }}>Operations Admin</strong>
                <span style={{ fontSize: '0.7rem', color: '#78716C' }}>ops@fooddelight.com</span>
              </div>
              <span className="admin-badge admin-badge-info">Fleet & Orders</span>
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => handleQuickLogin('finance@fooddelight.com', 'admin123')}
            >
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem' }}>Finance Admin</strong>
                <span style={{ fontSize: '0.7rem', color: '#78716C' }}>finance@fooddelight.com</span>
              </div>
              <span className="admin-badge admin-badge-warning">Payouts & Tax</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
