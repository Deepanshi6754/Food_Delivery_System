import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Bike, Mail, Lock, AlertCircle } from 'lucide-react';
import { riderLogin, clearRiderError } from '../../features/rider/riderAuthSlice';

export default function RiderLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.riderAuth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/rider/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearRiderError());
  }, [dispatch]);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    dispatch(riderLogin({ email: form.email.trim().toLowerCase(), password: form.password }));
  };

  const fillDemo = () => {
    setForm({ email: 'rider@fooddelight.com', password: 'rider123' });
    setErrors({});
    dispatch(clearRiderError());
  };

  return (
    <div className="rider-auth-page">
      <div className="rider-auth-card">
        {/* Logo */}
        <div className="rider-auth-logo">
          <div className="rider-auth-logo-icon">
            <Bike size={22} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rider-text)' }}>FoodDelight</div>
            <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)', fontWeight: 500 }}>Rider Portal</div>
          </div>
        </div>

        <h1 className="rider-auth-title">Welcome back, Rider! 👋</h1>
        <p className="rider-auth-subtitle">Sign in to start accepting deliveries</p>

        {/* Demo Card */}
        <div className="rider-demo-card">
          <h4>🚀 Demo Rider Credentials</h4>
          <p><strong>Email:</strong> rider@fooddelight.com</p>
          <p><strong>Password:</strong> rider123</p>
          <button onClick={fillDemo}>Click to auto-fill →</button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rider-alert rider-alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="rider-form-group">
            <label className="rider-form-label">Email Address <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--rider-text-secondary)'
              }} />
              <input
                type="email"
                className={`rider-form-input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: '38px' }}
                placeholder="rider@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {errors.email && <div className="rider-form-error">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="rider-form-group">
            <label className="rider-form-label">Password <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--rider-text-secondary)'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`rider-form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--rider-text-secondary)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <div className="rider-form-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="rider-btn rider-btn-primary rider-btn-full rider-btn-lg"
            disabled={isLoading}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white', animation: 'spin 0.8s linear infinite'
                }} />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="rider-auth-link" style={{ marginTop: '20px' }}>
          New rider? <Link to="/rider/register">Register here</Link>
        </div>

        <div className="rider-auth-link">
          <Link to="/" style={{ color: 'var(--rider-text-secondary)' }}>← Back to FoodDelight</Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
