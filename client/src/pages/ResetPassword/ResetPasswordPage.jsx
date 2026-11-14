import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Lock, Eye, EyeOff, UtensilsCrossed, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { loadMe } from '../../features/auth/authSlice';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(loadMe());
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-brand-center">
          <div className="brand-icon lg">
            <UtensilsCrossed size={26} color="#FFFFFF" />
          </div>
          <h2 className="auth-title">Choose New Password</h2>
          <p className="auth-sub">Enter and confirm your new secure password</p>
        </div>

        {error && (
          <div className="alert-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">New Password (Min 6 chars)</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                className="form-input has-icon has-eye"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className="form-input has-icon"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Save & Log In'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <Link to="/login" className="back-to-login-link">
            Cancel & Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

