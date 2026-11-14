import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Calendar,
  Percent,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import ownerApi from '../../services/ownerApi';

export default function OwnerPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountPercentage: 20,
    maxDiscount: 100, // in ₹
    minOrderValue: 249, // in ₹
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    usageLimit: 500
  });

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const res = await ownerApi.get('/promotions');
      setPromotions(res.data.promotions || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description,
        discountPercentage: Number(formData.discountPercentage),
        maxDiscount: Math.round(Number(formData.maxDiscount) * 100),
        minOrderValue: Math.round(Number(formData.minOrderValue) * 100),
        expiresAt: new Date(formData.expiresAt),
        usageLimit: Number(formData.usageLimit)
      };

      await ownerApi.post('/promotions', payload);
      setShowCreateModal(false);
      setFormData({
        code: '',
        description: '',
        discountPercentage: 20,
        maxDiscount: 100,
        minOrderValue: 249,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        usageLimit: 500
      });
      fetchPromotions();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create promo code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    try {
      await ownerApi.delete(`/promotions/${promoId}`);
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete promotion.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="owner-page-header">
        <div className="owner-page-header-text">
          <h1>Promotions & Restaurant Discounts</h1>
          <p>Create attractive coupon codes to boost order volume and attract diners.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="owner-btn-primary">
          <Plus size={18} />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Promotions List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#F97316', fontWeight: 700 }}>
          Loading coupons...
        </div>
      ) : promotions.length === 0 ? (
        <div className="owner-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Tag size={48} color="#D6D3D1" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No active restaurant promotions</h3>
          <p style={{ color: '#78716C' }}>
            Boost orders during off-peak hours with custom promo discounts.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="owner-btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Create First Offer
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {promotions.map((promo) => {
            const isExpired = new Date(promo.expiresAt) < new Date();
            const isPlatform = promo.isPlatformWide;

            return (
              <div
                key={promo._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: isPlatform ? '1px dashed #78716C' : '1px solid #E7E5E4',
                  padding: '1.25rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isExpired ? 0.6 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        background: '#FFF8F0',
                        border: '1px dashed #F97316',
                        color: '#EA580C',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        letterSpacing: '1px'
                      }}
                    >
                      {promo.code}
                    </div>

                    {isPlatform ? (
                      <span style={{ fontSize: '0.75rem', background: '#F5F5F4', color: '#78716C', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        Platform Offer
                      </span>
                    ) : isExpired ? (
                      <span style={{ fontSize: '0.75rem', background: '#FEE2E2', color: '#DC2626', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        Expired
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#15803D', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        Active
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#292524', fontWeight: 600 }}>
                    {promo.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#78716C' }}>
                    <div>
                      Discount: <strong>{promo.discountPercentage}% OFF</strong> (up to ₹{((promo.maxDiscount || 0) / 100).toFixed(0)})
                    </div>
                    <div>
                      Min. Order: <strong>₹{((promo.minOrderValue || 0) / 100).toFixed(0)}</strong>
                    </div>
                    <div>
                      Expires: <strong>{new Date(promo.expiresAt).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>

                {!isPlatform && (
                  <div style={{ borderTop: '1px solid #E7E5E4', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete Coupon</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: '480px' }}>
            <div className="owner-modal-header">
              <h3>Create Restaurant Coupon</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="owner-modal-body">
              {errorMsg && (
                <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleCreatePromo}>
                <div className="owner-form-group">
                  <label>Coupon Code * (e.g. CHEF20)</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="FEAST25"
                    required
                    style={{ textTransform: 'uppercase' }}
                    className="owner-form-input"
                  />
                </div>

                <div className="owner-form-group">
                  <label>Public Offer Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="25% OFF on orders above ₹249"
                    required
                    className="owner-form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="owner-form-group">
                    <label>Discount % *</label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      required
                      className="owner-form-input"
                    />
                  </div>

                  <div className="owner-form-group">
                    <label>Max Cap in ₹</label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      min="0"
                      className="owner-form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="owner-form-group">
                    <label>Min. Order in ₹</label>
                    <input
                      type="number"
                      name="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={handleChange}
                      min="0"
                      className="owner-form-input"
                    />
                  </div>

                  <div className="owner-form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      name="expiresAt"
                      value={formData.expiresAt}
                      onChange={handleChange}
                      required
                      className="owner-form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="owner-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="owner-btn-primary">
                    <span>{submitting ? 'Creating...' : 'Publish Coupon'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

