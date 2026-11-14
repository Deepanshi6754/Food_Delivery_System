import React, { useState } from 'react';
import { X, Plus, MapPin, Check, Home, Briefcase, Navigation } from 'lucide-react';
import api from '../../services/api';

export default function AddressSelectorModal({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressAdded
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    houseNo: '',
    street: '',
    area: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '',
    deliveryInstructions: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/addresses', formData);
      if (onAddressAdded) onAddressAdded(res.data.data);
      if (onSelectAddress) onSelectAddress(res.data.data._id);
      setIsAddingNew(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const getLabelIcon = (label) => {
    if (label === 'Home') return <Home size={16} />;
    if (label === 'Work') return <Briefcase size={16} />;
    return <Navigation size={16} />;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content address-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <MapPin size={22} className="text-orange" />
            <h3 className="modal-title">
              {isAddingNew ? 'Add New Delivery Address' : 'Select Delivery Address'}
            </h3>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {!isAddingNew ? (
            <>
              {/* Existing Addresses List */}
              <div className="addresses-list">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      className={`address-card-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        onSelectAddress(addr._id);
                        onClose();
                      }}
                    >
                      <div className="addr-top-row">
                        <div className="addr-label-tag">
                          {getLabelIcon(addr.label)}
                          <span>{addr.label}</span>
                          {addr.isDefault && <span className="default-pill">Default</span>}
                        </div>
                        <div className={`addr-radio ${isSelected ? 'active' : ''}`}>
                          {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                      </div>

                      <h4 className="addr-recipient">{addr.recipientName} • {addr.phone}</h4>
                      <p className="addr-full-text">
                        {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      {addr.deliveryInstructions && (
                        <p className="addr-instructions">
                          Note: {addr.deliveryInstructions}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                className="btn btn-outline btn-add-new-addr"
                onClick={() => setIsAddingNew(true)}
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            </>
          ) : (
            /* New Address Form */
            <form onSubmit={handleSubmitNew} className="new-address-form">
              {/* Label selector: Home, Work, Other */}
              <div className="label-toggle-row">
                {['Home', 'Work', 'Other'].map((lbl) => (
                  <button
                    type="button"
                    key={lbl}
                    className={`btn-label-tag ${formData.label === lbl ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, label: lbl })}
                  >
                    {getLabelIcon(lbl)}
                    <span>{lbl}</span>
                  </button>
                ))}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Recipient Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Flat / House / Floor No *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.houseNo}
                    onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Street / Society *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Area / Locality *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nearby Landmark</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Leave with security guard, call upon arrival"
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving Address...' : 'Save & Select Address'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

