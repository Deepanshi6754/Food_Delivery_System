import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Bike, AlertCircle, CheckCircle } from 'lucide-react';
import { riderRegister, clearRiderError, clearRegisterSuccess } from '../../features/rider/riderAuthSlice';

const VEHICLE_TYPES = ['Motorcycle', 'Scooter', 'Bicycle', 'Electric Scooter', 'Car'];

export default function RiderRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, registerSuccess } = useSelector((state) => state.riderAuth);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    vehicleType: 'Motorcycle', vehicleNumber: '', licenseNumber: '', preferredArea: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { dispatch(clearRiderError()); dispatch(clearRegisterSuccess()); }, [dispatch]);

  useEffect(() => {
    if (registerSuccess) {
      setTimeout(() => { navigate('/rider/login'); }, 3000);
    }
  }, [registerSuccess, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.vehicleNumber.trim()) errs.vehicleNumber = 'Vehicle number is required';
    if (!form.licenseNumber.trim()) errs.licenseNumber = 'License number is required';
    return errs;
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const { confirmPassword, ...payload } = form;
    dispatch(riderRegister(payload));
  };

  if (registerSuccess) {
    return (
      <div className="rider-auth-page">
        <div className="rider-auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--rider-success-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            color: 'var(--rider-success)'
          }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--rider-text)', marginBottom: '8px' }}>
            Registration Submitted!
          </h2>
          <p style={{ color: 'var(--rider-text-secondary)', marginBottom: '16px' }}>
            Your rider application is under review. Once approved by our team, you can start accepting deliveries.
          </p>
          <div className="rider-alert rider-alert-info" style={{ textAlign: 'left', marginBottom: '16px' }}>
            <span>📋 Approval usually takes 1-2 business days. Redirecting to login...</span>
          </div>
          <Link to="/rider/login" className="rider-btn rider-btn-primary rider-btn-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const Field = ({ label, name, type = 'text', placeholder, required, children }) => (
    <div className="rider-form-group">
      <label className="rider-form-label">{label} {required && <span>*</span>}</label>
      {children || (
        <input
          type={type}
          className={`rider-form-input ${errors[name] ? 'error' : ''}`}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange(name)}
        />
      )}
      {errors[name] && <div className="rider-form-error">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="rider-auth-page" style={{ padding: '32px 24px' }}>
      <div className="rider-auth-card" style={{ maxWidth: '540px' }}>
        <div className="rider-auth-logo">
          <div className="rider-auth-logo-icon"><Bike size={22} /></div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--rider-text)' }}>FoodDelight</div>
            <div style={{ fontSize: '12px', color: 'var(--rider-text-secondary)' }}>Rider Portal</div>
          </div>
        </div>

        <h1 className="rider-auth-title">Become a Delivery Partner</h1>
        <p className="rider-auth-subtitle">Join our fleet and start earning today</p>

        {error && (
          <div className="rider-alert rider-alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rider-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Personal Information
          </div>

          <div className="rider-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Full Name" name="name" placeholder="Rahul Sharma" required />
            <Field label="Phone Number" name="phone" placeholder="+91 98765 43210" required />
          </div>

          <Field label="Email Address" name="email" type="email" placeholder="rider@example.com" required />

          <div className="rider-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="rider-form-group">
              <label className="rider-form-label">Password <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`rider-form-input ${errors.password ? 'error' : ''}`}
                  style={{ paddingRight: '38px' }}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange('password')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rider-text-secondary)'
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <div className="rider-form-error">{errors.password}</div>}
            </div>

            <div className="rider-form-group">
              <label className="rider-form-label">Confirm Password <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={`rider-form-input ${errors.confirmPassword ? 'error' : ''}`}
                  style={{ paddingRight: '38px' }}
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rider-text-secondary)'
                }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="rider-form-error">{errors.confirmPassword}</div>}
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--rider-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '16px 0 12px' }}>
            Vehicle & License Details
          </div>

          <div className="rider-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="rider-form-group">
              <label className="rider-form-label">Vehicle Type <span>*</span></label>
              <select
                className="rider-form-select"
                value={form.vehicleType}
                onChange={handleChange('vehicleType')}
              >
                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <Field label="Vehicle Number" name="vehicleNumber" placeholder="DL-01-AB-1234" required />
          </div>

          <div className="rider-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Driving License No." name="licenseNumber" placeholder="DL-123456789" required />
            <Field label="Preferred Delivery Area" name="preferredArea" placeholder="e.g. South Delhi" />
          </div>

          <div className="rider-alert rider-alert-info" style={{ marginBottom: '16px', fontSize: '12px' }}>
            📋 Your account will be reviewed by our team before activation. You will be notified once approved.
          </div>

          <button
            type="submit"
            className="rider-btn rider-btn-primary rider-btn-full rider-btn-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting Application...' : 'Submit Rider Application'}
          </button>
        </form>

        <div className="rider-auth-link" style={{ marginTop: '16px' }}>
          Already registered? <Link to="/rider/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
