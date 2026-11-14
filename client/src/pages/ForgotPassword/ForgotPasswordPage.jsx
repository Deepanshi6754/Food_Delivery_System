import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, UtensilsCrossed, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
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
          <h2 className="auth-title">Reset Your Password</h2>
          <p className="auth-sub">Enter your email and we'll send you a password reset link</p>
        </div>

        {error && (
          <div className="alert-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="forgot-success-box">
            <CheckCircle2 size={36} className="text-success" />
            <h4 className="success-heading">Reset Link Generated!</h4>
            <p className="success-sub">
              For quick local demonstration, you can click the button below to set your new password immediately:
            </p>
            <Link
              to={`/reset-password/${successData.resetToken}`}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              Reset Password Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="demo@fooddelight.com"
                  className="form-input has-icon"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer-prompt">
          <Link to="/login" className="back-to-login-link">
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

