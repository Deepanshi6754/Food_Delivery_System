import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Percent,
  Calendar,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountAmount: 20,
    minOrderAmount: 200,
    maxDiscountAmount: 100,
    validUntil: '',
    usageLimit: 1000,
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountAmount: 20,
      minOrderAmount: 200,
      maxDiscountAmount: 100,
      validUntil: in30Days,
      usageLimit: 1000,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountAmount: c.discountAmount,
      minOrderAmount: (c.minOrderAmount || 0) / 100,
      maxDiscountAmount: c.maxDiscountAmount ? c.maxDiscountAmount / 100 : '',
      validUntil: c.validUntil ? new Date(c.validUntil).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit || 1000,
      isActive: c.isActive !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = {
        ...form,
        minOrderAmount: Math.round(Number(form.minOrderAmount || 0) * 100),
        maxDiscountAmount: form.maxDiscountAmount ? Math.round(Number(form.maxDiscountAmount) * 100) : undefined
      };

      if (editingCoupon) {
        await adminApi.put(`/coupons/${editingCoupon._id}`, payload);
      } else {
        await adminApi.post('/coupons', payload);
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${c.code}"?`)) return;
    try {
      await adminApi.delete(`/coupons/${c._id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete coupon.');
    }
  };

  const formatPrice = (paise) => {
    return `₹${((paise || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons & Platform Promotions</h1>
          <p className="admin-page-subtitle">
            Create promotional discount codes, enforce minimum order thresholds, and track redemption limits
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Description</th>
              <th>Min Order</th>
              <th>Max Cap</th>
              <th>Usage</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                  Loading coupon promotions...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                  No coupons found. Click "Create Coupon" to launch a campaign.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={14} color="#F97316" />
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#F97316' }}>
                        {c.code}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.9rem' }}>
                      {c.discountType === 'percentage' ? `${c.discountAmount}% OFF` : `₹${(c.discountAmount / 100).toFixed(0)} OFF`}
                    </strong>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#78716C', maxWidth: '200px' }}>
                    {c.description || 'General discount'}
                  </td>
                  <td>{formatPrice(c.minOrderAmount)}</td>
                  <td>{c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'No Cap'}</td>
                  <td>
                    <span className="admin-badge admin-badge-info">
                      {c.usedCount || 0} / {c.usageLimit || 1000}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${c.isActive ? 'admin-badge-success' : 'admin-badge-neutral'}`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openEditModal(c)}
                        title="Edit Coupon"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => handleDelete(c)}
                        title="Delete Coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      style={{ textTransform: 'uppercase', fontWeight: 700 }}
                      className="admin-form-control"
                      placeholder="e.g. FESTIVE30"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Discount Type *</label>
                    <select
                      className="admin-form-control"
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Rupee Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      {form.discountType === 'percentage' ? 'Percentage Off (%) *' : 'Discount in Rupees (₹) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="admin-form-control"
                      value={form.discountAmount}
                      onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Min Order Threshold (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-form-control"
                      placeholder="200"
                      value={form.minOrderAmount}
                      onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-form-control"
                      placeholder="e.g. 100"
                      value={form.maxDiscountAmount}
                      onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="admin-form-control"
                      value={form.validUntil}
                      onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Campaign Description</label>
                  <textarea
                    rows="2"
                    className="admin-form-control"
                    placeholder="e.g. Get 20% off on all weekend pizza orders..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="couponActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <label htmlFor="couponActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    Coupon is active and redeemable by customers
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
