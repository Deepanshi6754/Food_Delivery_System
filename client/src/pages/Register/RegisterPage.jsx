import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Lock, Mail, Phone, User, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { registerUser } from '../../features/auth/authSlice';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    const result = await dispatch(
      registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
    );

    if (registerUser.fulfilled.match(result)) {
      navigate(redirectUrl);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-center">
          <div className="brand-icon lg">
            <UtensilsCrossed size={26} color="#FFFFFF" />
          </div>
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-sub">Join FoodDelight for premium food ordering</p>
        </div>

        {(error || validationError) && (
          <div className="alert-error-banner">
            <AlertCircle size={16} />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Rahul Verma"
                className="form-input has-icon"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                className="form-input has-icon"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="form-input has-icon"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 6 chars)</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="form-input has-icon has-eye"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                className="form-input has-icon"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Already have an account?</span>{' '}
          <Link to={`/login${location.search}`} className="auth-accent-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

