import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Bell,
  ExternalLink,
  CheckCircle2,
  Clock,
  User,
  LogOut
} from 'lucide-react';
import { ownerLogout } from '../../features/owner/ownerAuthSlice';

export default function OwnerTopHeader({ onToggleSidebar, notifications = [], onClearNotification }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { ownerUser, restaurant } = useSelector((state) => state.ownerAuth);

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isApproved = restaurant?.approvalStatus === 'approved';

  const handleLogout = () => {
    dispatch(ownerLogout());
    navigate('/owner/login');
  };

  return (
    <header className="owner-header">
      {/* Left: Mobile hamburger & Restaurant identity */}
      <div className="owner-header-left">
        <button
          onClick={onToggleSidebar}
          className="owner-header-action-btn"
          style={{ display: 'none' }} // Visible on mobile via CSS
          id="owner-mobile-menu-btn"
        >
          <MenuIcon size={20} />
        </button>

        <div className="owner-restaurant-badge">
          <img
            src={
              restaurant?.image ||
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'
            }
            alt={restaurant?.name || 'Restaurant'}
            className="owner-restaurant-avatar"
          />
          <div className="owner-restaurant-title">
            <h3>
              {restaurant?.name || 'My Restaurant'}
              <span
                className={`owner-approval-pill ${
                  isApproved ? 'approved' : 'pending'
                }`}
              >
                {isApproved ? 'Verified Partner' : 'Pending Verification'}
              </span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#78716C' }}>
              {restaurant?.cuisine?.join(', ') || 'Multi-cuisine'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="owner-header-right">
        {restaurant?.slug && (
          <Link
            to={`/restaurants/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="owner-header-action-btn"
            title="Preview how customers see your restaurant"
          >
            <ExternalLink size={16} />
            <span>Storefront Preview</span>
          </Link>
        )}

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className="owner-notif-btn"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="owner-notif-dot" />}
          </button>

          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '320px',
                background: '#ffffff',
                border: '1px solid #E7E5E4',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                padding: '1rem',
                zIndex: 200
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  borderBottom: '1px solid #E7E5E4',
                  paddingBottom: '0.5rem'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  Live Store Alerts
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#F97316', fontWeight: 600 }}>
                  {notifications.length} New
                </span>
              </div>

              {notifications.length === 0 ? (
                <p style={{ margin: 0, color: '#78716C', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                  No unread alerts
                </p>
              ) : (
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {notifications.map((n, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem',
                        background: '#FFF8F0',
                        borderRadius: '8px',
                        border: '1px solid #FFEDD5',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#292524' }}>{n.title}</div>
                      <div style={{ color: '#78716C', fontSize: '0.8rem' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: 0
            }}
          >
            <img
              src={
                ownerUser?.avatar ||
                'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100'
              }
              alt={ownerUser?.name || 'Owner'}
              className="owner-user-avatar"
            />
            <div style={{ textAlign: 'left', display: 'none' }} className="owner-profile-name-text">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#292524' }}>
                {ownerUser?.name || 'Chef Partner'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#78716C' }}>
                {ownerUser?.email}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: '200px',
                background: '#ffffff',
                border: '1px solid #E7E5E4',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                padding: '0.5rem',
                zIndex: 200
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #E7E5E4' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{ownerUser?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#78716C' }}>Owner / Manager</div>
              </div>
              <Link
                to="/owner/restaurant"
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.85rem',
                  color: '#292524',
                  textDecoration: 'none',
                  borderRadius: '6px'
                }}
              >
                <User size={16} />
                <span>Store Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.85rem',
                  color: '#DC2626',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

