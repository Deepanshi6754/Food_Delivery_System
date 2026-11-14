import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ownerLogin, clearOwnerError } from '../../features/owner/ownerAuthSlice';

export default function OwnerLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.ownerAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/owner/dashboard');
    }
    return () => {
      dispatch(clearOwnerError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(ownerLogin({ email, password }));
  };

  const handleFillDemo = () => {
    setEmail('owner@fooddelight.com');
    setPassword('owner123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
          border: '1px solid #E7E5E4'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 20px rgba(249, 115, 22, 0.3)'
            }}
          >
            <Store size={28} />
          </div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#292524',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.5px'
            }}
          >
            Restaurant Partner Portal
          </h1>
          <p style={{ margin: 0, color: '#78716C', fontSize: '0.9rem' }}>
            Manage kitchen orders, menus, reviews and earnings.
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div
          onClick={handleFillDemo}
          style={{
            background: '#FFF8F0',
            border: '1px dashed #F97316',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={18} color="#F97316" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#EA580C' }}>
                One-Click Demo Owner Access
              </div>
              <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
                owner@fooddelight.com / owner123
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#F97316',
              background: '#FFEDD5',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px'
            }}
          >
            Auto-fill
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              border: '1px solid #FECACA'
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="owner-form-group">
            <label>Partner Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@restaurant.com"
                required
                className="owner-form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={18}
                color="#A8A29E"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="owner-form-group">
            <label>Account Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="owner-form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={18}
                color="#A8A29E"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="owner-btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '0.5rem'
            }}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop: '1.75rem', textAlign: 'center', borderTop: '1px solid #E7E5E4', paddingTop: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#78716C' }}>
            Want to partner with FoodDelight?{' '}
            <Link
              to="/owner/register"
              style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}
            >
              Register your restaurant
            </Link>
          </p>
          <div style={{ marginTop: '0.75rem' }}>
            <Link
              to="/"
              style={{ fontSize: '0.8rem', color: '#78716C', textDecoration: 'underline' }}
            >
              ← Back to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

