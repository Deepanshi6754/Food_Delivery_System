import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Store,
  Clock,
  MapPin,
  Mail,
  Phone,
  Save,
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import ownerApi from '../../services/ownerApi';
import { setRestaurantData } from '../../features/owner/ownerAuthSlice';

export default function OwnerRestaurantPage() {
  const dispatch = useDispatch();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    image: '',
    coverImage: '',
    contactEmail: '',
    contactPhone: '',
    street: '',
    area: '',
    city: 'New Delhi',
    pincode: '110001',
    openingTime: '09:00 AM',
    closingTime: '11:00 PM',
    preparationTime: 25,
    minOrderValue: 149, // in ₹
    priceForTwo: 450, // in ₹
    isPureVeg: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await ownerApi.get('/restaurant/profile');
        const r = res.data.restaurant;
        setRestaurant(r);
        setFormData({
          name: r.name || '',
          description: r.description || '',
          cuisine: (r.cuisine || []).join(', '),
          image: r.image || '',
          coverImage: r.coverImage || '',
          contactEmail: r.contactEmail || '',
          contactPhone: r.contactPhone || '',
          street: r.address?.street || '',
          area: r.address?.area || '',
          city: r.address?.city || 'New Delhi',
          pincode: r.address?.pincode || '110001',
          openingTime: r.openingTime || '09:00 AM',
          closingTime: r.closingTime || '11:00 PM',
          preparationTime: r.preparationTime || 25,
          minOrderValue: ((r.minOrderValue || 0) / 100).toString(),
          priceForTwo: ((r.priceForTwo || 0) / 100).toString(),
          isPureVeg: r.isPureVeg || false
        });
      } catch (err) {
        setErrorMsg('Failed to load restaurant profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        cuisine: formData.cuisine.split(',').map((c) => c.trim()).filter(Boolean),
        image: formData.image,
        coverImage: formData.coverImage,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: {
          street: formData.street,
          area: formData.area,
          city: formData.city,
          pincode: formData.pincode
        },
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        preparationTime: Number(formData.preparationTime),
        minOrderValue: Math.round(Number(formData.minOrderValue) * 100),
        priceForTwo: Math.round(Number(formData.priceForTwo) * 100),
        isPureVeg: formData.isPureVeg
      };

      const res = await ownerApi.put('/restaurant/profile', payload);
      setRestaurant(res.data.restaurant);
      dispatch(setRestaurantData(res.data.restaurant));
      setSuccessMsg('Restaurant profile information saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: '#F97316', fontWeight: 700 }}>
        Loading restaurant profile...
      </div>
    );
  }

  const isApproved = restaurant?.approvalStatus === 'approved';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Restaurant Profile & Operations</h1>
          <p>Update storefront branding, contact channels, address, and operating hours.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className={`owner-approval-pill ${isApproved ? 'approved' : 'pending'}`}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            {isApproved ? 'Platform Verified' : 'Pending Admin Verification'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            background: '#DCFCE7',
            border: '1px solid #BBF7D0',
            color: '#15803D',
            padding: '1rem',
            borderRadius: '10px',
            fontWeight: 700,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '1rem',
            borderRadius: '10px',
            fontWeight: 700,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Edit Form */}
      <div className="owner-card">
        <form onSubmit={handleSubmit}>
          {/* Identity & Basic Info */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
            Store Identity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Restaurant Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Cuisines (Comma separated) *</label>
              <input
                type="text"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                placeholder="Italian, Pizza, Fast Food"
                required
                className="owner-form-input"
              />
            </div>
          </div>

          <div className="owner-form-group">
            <label>Store Bio / Description</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="owner-form-textarea"
            />
          </div>

          {/* Media / Imagery */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '1.5rem 0 1rem 0' }}>
            Brand Imagery
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Store Logo Image URL *</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="owner-form-input"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Logo Preview"
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', marginTop: '0.5rem' }}
                />
              )}
            </div>

            <div className="owner-form-group">
              <label>Cover Banner Image URL *</label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                required
                className="owner-form-input"
              />
              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Banner Preview"
                  style={{ width: '100%', height: '60px', borderRadius: '8px', objectFit: 'cover', marginTop: '0.5rem' }}
                />
              )}
            </div>
          </div>

          {/* Contact Details */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '1.5rem 0 1rem 0' }}>
            Direct Contact Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Official Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Contact Phone Number *</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
                className="owner-form-input"
              />
            </div>
          </div>

          {/* Address */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '1.5rem 0 1rem 0' }}>
            Physical Outlet Address
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="owner-form-group">
              <label>Street / Shop No.</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="owner-form-input"
              />
            </div>
            <div className="owner-form-group">
              <label>Area / Locality</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="owner-form-input"
              />
            </div>
            <div className="owner-form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="owner-form-input"
              />
            </div>
            <div className="owner-form-group">
              <label>PIN Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="owner-form-input"
              />
            </div>
          </div>

          {/* Fulfillment & Timings */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '1.5rem 0 1rem 0' }}>
            Operations & Timings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="owner-form-group">
              <label>Opening Time</label>
              <input
                type="text"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                placeholder="09:00 AM"
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Closing Time</label>
              <input
                type="text"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                placeholder="11:00 PM"
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Average Prep Time (Mins)</label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                min="10"
                max="120"
                className="owner-form-input"
              />
            </div>

            <div className="owner-form-group">
              <label>Min. Order Value (₹)</label>
              <input
                type="number"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
                min="0"
                className="owner-form-input"
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isPureVeg"
                checked={formData.isPureVeg}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#15803D' }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Mark Restaurant as 100% Pure Vegetarian
              </span>
            </label>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E7E5E4', paddingTop: '1.25rem' }}>
            <button type="submit" disabled={saving} className="owner-btn-primary">
              <Save size={18} />
              <span>{saving ? 'Updating Store...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

