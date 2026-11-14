import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Lock, Mail, UtensilsCrossed, AlertCircle, Sparkles } from 'lucide-react';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ identifier, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(redirectUrl);
    }
  };

  const handleQuickFillCustomer = () => {
    setIdentifier('demo@fooddelight.com');
    setPassword('password123');
  };

  const handleQuickFillAdmin = () => {
    setIdentifier('admin@fooddelight.com');
    setPassword('admin123');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-center">
          <div className="brand-icon lg">
            <UtensilsCrossed size={26} color="#FFFFFF" />
          </div>
          <h2 className="auth-title">Welcome to FoodDelight</h2>
          <p className="auth-sub">Sign in to your account to order and track food</p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="demo-credentials-box">
          <div className="demo-badge">
            <Sparkles size={14} className="text-orange" />
            <span>QUICK DEMO LOGIN</span>
          </div>
          <div className="demo-btns-row">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleQuickFillCustomer}
            >
              Demo Customer
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleQuickFillAdmin}
            >
              Demo Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address or Phone</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                placeholder="demo@fooddelight.com or phone"
                className="form-input has-icon"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="form-input has-icon has-eye"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Don't have an account yet?</span>{' '}
          <Link to={`/register${location.search}`} className="auth-accent-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

