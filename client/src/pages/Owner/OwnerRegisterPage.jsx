import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Store, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ownerRegister, clearOwnerError } from '../../features/owner/ownerAuthSlice';

export default function OwnerRegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, successMessage } = useSelector((state) => state.ownerAuth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    restaurantName: '',
    cuisine: 'North Indian, Street Food',
    street: '',
    city: 'New Delhi',
    pincode: '110001',
    description: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearOwnerError());

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      restaurantName: formData.restaurantName,
      cuisine: formData.cuisine.split(',').map((c) => c.trim()).filter(Boolean),
      description: formData.description,
      address: {
        street: formData.street,
        city: formData.city,
        pincode: formData.pincode
      }
    };

    const res = await dispatch(ownerRegister(payload));
    if (!res.error) {
      setSubmitted(true);
    }
  };

  if (submitted) {
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
            maxWidth: '520px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
            border: '1px solid #E7E5E4'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#DCFCE7',
              color: '#15803D',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}
          >
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            Application Submitted!
          </h2>
          <p style={{ color: '#78716C', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Your restaurant registration for <strong>{formData.restaurantName}</strong> has been received. In accordance with platform quality standards, new restaurant applications are reviewed by our administration team before being publicly listed.
          </p>
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#92400E',
              marginBottom: '2rem'
            }}
          >
            Status: <strong>Pending Administrator Verification</strong>
          </div>
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="owner-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Proceed to Partner Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
          border: '1px solid #E7E5E4'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem auto'
            }}
          >
            <Store size={26} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
            Partner With FoodDelight
          </h1>
          <p style={{ margin: 0, color: '#78716C', fontSize: '0.9rem' }}>
            Grow your culinary business with instant access to thousands of hungry foodies.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              border: '1px solid #FECACA'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Owner Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Chef Sanjeev Kumar"
                required
                className="owner-form-input"
              />
            </div>
            <div className="owner-form-group">
              <label>Owner Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
                className="owner-form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Business Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="partner@kitchen.com"
                required
                className="owner-form-input"
              />
            </div>
            <div className="owner-form-group">
              <label>Password (min 6 characters) *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="owner-form-input"
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E7E5E4', margin: '1.5rem 0' }} />

          <div className="owner-form-group">
            <label>Restaurant Business Name *</label>
            <input
              type="text"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              placeholder="The Royal Bistro"
              required
              className="owner-form-input"
            />
          </div>

          <div className="owner-form-group">
            <label>Cuisines Offered (comma separated) *</label>
            <input
              type="text"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              placeholder="North Indian, Mughlai, Biryani"
              required
              className="owner-form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Street / Commercial Address *</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Shop 12, Main Market"
                required
                className="owner-form-input"
              />
            </div>
            <div className="owner-form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New Delhi"
                required
                className="owner-form-input"
              />
            </div>
            <div className="owner-form-group">
              <label>PIN Code *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="110001"
                required
                className="owner-form-input"
              />
            </div>
          </div>

          <div className="owner-form-group">
            <label>Short Kitchen Description</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Serving authentic clay-oven specialties made fresh to order."
              className="owner-form-textarea"
            />
          </div>

          <div
            style={{
              background: '#FFF8F0',
              border: '1px solid #FFEDD5',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#78716C',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <ShieldAlert size={18} color="#F97316" />
            <span>
              By submitting, you agree to our 15% platform partner commission on completed fulfillment orders.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="owner-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          >
            {isLoading ? 'Submitting Partner Application...' : 'Submit Restaurant Registration'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#78716C' }}>
            Already an approved partner?{' '}
            <Link to="/owner/login" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>
              Sign In Here
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

