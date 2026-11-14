import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  MapPin,
  Lock,
  Package,
  Heart,
  Tag,
  HelpCircle,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Navigation
} from 'lucide-react';
import api from '../../services/api';
import { updateProfile, logout } from '../../features/auth/authSlice';
import AddressSelectorModal from '../../components/checkout/AddressSelectorModal';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info');
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setAvatar(user.avatar);
    }

    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        setAddresses(res.data.data);
      } catch (e) {}
    };

    fetchAddresses();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileMsg('');
      await dispatch(updateProfile({ name, phone, avatar })).unwrap();
      setProfileMsg('Profile information updated successfully!');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      alert(err || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${addrId}`);
      setAddresses(addresses.filter((a) => a._id !== addrId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      await api.put(`/addresses/${addrId}/default`);
      setAddresses(
        addresses.map((a) => ({
          ...a,
          isDefault: a._id === addrId
        }))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default address');
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="container">
        <div className="profile-layout-grid">
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-sidebar-header">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="profile-user-avatar"
              />
              <div className="profile-user-info">
                <h3 className="profile-username">{user?.name}</h3>
                <span className="profile-useremail">{user?.email}</span>
              </div>
            </div>

            <nav className="profile-sidebar-nav">
              <button
                className={`profile-nav-item ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <User size={18} />
                <span>Personal Information</span>
              </button>

              <button
                className={`profile-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={18} />
                <span>Saved Addresses</span>
              </button>

              <button
                className={`profile-nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <Lock size={18} />
                <span>Change Password</span>
              </button>

              <div className="profile-nav-divider" />

              <button
                className="profile-nav-item"
                onClick={() => navigate('/my-orders')}
              >
                <Package size={18} />
                <span>My Orders</span>
              </button>

              <button
                className="profile-nav-item"
                onClick={() => navigate('/wishlist')}
              >
                <Heart size={18} />
                <span>My Wishlist</span>
              </button>

              <button
                className="profile-nav-item"
                onClick={() => navigate('/offers')}
              >
                <Tag size={18} />
                <span>My Coupons</span>
              </button>

              <button
                className="profile-nav-item"
                onClick={() => navigate('/support')}
              >
                <HelpCircle size={18} />
                <span>Help & Support</span>
              </button>

              <div className="profile-nav-divider" />

              <button
                className="profile-nav-item text-danger"
                onClick={() => {
                  dispatch(logout());
                  navigate('/');
                }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Right Main Content */}
          <div className="profile-main-content">
            {activeTab === 'info' && (
              <div className="profile-card">
                <h2 className="profile-section-heading">Personal Information</h2>
                <p className="profile-section-sub">Update your account profile details</p>

                {profileMsg && (
                  <div className="alert-success-banner" style={{ margin: '1rem 0' }}>
                    <CheckCircle2 size={16} />
                    <span>{profileMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ marginTop: '1.5rem' }}>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      className="form-input"
                      value={user?.email || ''}
                      disabled
                      style={{ background: '#F5F5F4', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Avatar Photo URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="profile-card">
                <div className="page-header-row" style={{ marginBottom: '1.25rem' }}>
                  <div>
                    <h2 className="profile-section-heading">Saved Addresses</h2>
                    <p className="profile-section-sub">Manage locations for quick checkout</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    <Plus size={16} />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="profile-addresses-grid">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="address-box-card">
                      <div className="addr-badge">
                        <span>{addr.label}</span>
                        {addr.isDefault && <span className="default-pill">Default</span>}
                      </div>

                      <h4 className="addr-recip-name">{addr.recipientName} • {addr.phone}</h4>
                      <p className="addr-street-line">
                        {addr.houseNo}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>

                      <div className="addr-card-actions-row">
                        {!addr.isDefault && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleSetDefaultAddress(addr._id)}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm text-danger"
                          onClick={() => handleDeleteAddress(addr._id)}
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="profile-card">
                <h2 className="profile-section-heading">Change Password</h2>
                <p className="profile-section-sub">Ensure your account uses a strong, secure password</p>

                {passwordMsg && (
                  <div className="alert-success-banner" style={{ margin: '1rem 0' }}>
                    <CheckCircle2 size={16} />
                    <span>{passwordMsg}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="form-error" style={{ margin: '1rem 0', display: 'flex', gap: 6 }}>
                    <AlertCircle size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} style={{ marginTop: '1.5rem', maxWidth: 440 }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password (at least 6 characters)</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Creator Modal */}
      <AddressSelectorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        onAddressAdded={(newAddr) => {
          setAddresses([newAddr, ...addresses]);
        }}
      />
    </div>
  );
}

