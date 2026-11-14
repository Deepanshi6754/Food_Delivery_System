import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Store,
  Star,
  Tag,
  Wallet,
  Settings,
  LogOut,
  Power
} from 'lucide-react';
import { ownerLogout, toggleRestaurantStatus } from '../../features/owner/ownerAuthSlice';

export default function OwnerSidebar({ isOpen, onClose, pendingOrdersCount = 0 }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { restaurant } = useSelector((state) => state.ownerAuth);

  const isStoreOpen = restaurant?.isOpen && !restaurant?.isTemporarilyClosed;

  const handleToggleStoreStatus = () => {
    dispatch(
      toggleRestaurantStatus({
        isOpen: !isStoreOpen,
        isTemporarilyClosed: false
      })
    );
  };

  const handleLogout = () => {
    dispatch(ownerLogout());
    navigate('/owner/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    {
      label: 'Live Orders',
      path: '/owner/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null
    },
    { label: 'Menu Catalog', path: '/owner/menu', icon: UtensilsCrossed },
    { label: 'Restaurant Profile', path: '/owner/restaurant', icon: Store },
    { label: 'Customer Reviews', path: '/owner/reviews', icon: Star },
    { label: 'Offers & Promos', path: '/owner/promotions', icon: Tag },
    { label: 'Revenue & Payouts', path: '/owner/earnings', icon: Wallet },
    { label: 'Settings', path: '/owner/settings', icon: Settings }
  ];

  return (
    <aside className={`owner-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="owner-sidebar-header">
        <NavLink to="/owner/dashboard" className="owner-brand">
          <div className="owner-brand-logo">FD</div>
          <div className="owner-brand-text">
            <h2>FoodDelight</h2>
            <span>Partner Hub</span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="owner-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `owner-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <div className="owner-nav-link-content">
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="owner-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Operating Switch */}
      <div className="owner-sidebar-footer">
        <div className="owner-status-card">
          <div className="owner-status-info">
            <h4>Store Availability</h4>
            <div className="owner-status-indicator">
              <span className={`status-dot ${isStoreOpen ? 'online' : 'offline'}`} />
              <span style={{ color: isStoreOpen ? '#15803D' : '#DC2626' }}>
                {isStoreOpen ? 'Accepting Orders' : 'Store Paused'}
              </span>
            </div>
          </div>
          <button
            onClick={handleToggleStoreStatus}
            className="owner-btn-secondary"
            style={{ padding: '0.4rem 0.6rem' }}
            title={isStoreOpen ? 'Pause Store' : 'Open Store'}
          >
            <Power size={16} color={isStoreOpen ? '#15803D' : '#DC2626'} />
          </button>
        </div>

        <button onClick={handleLogout} className="owner-logout-btn">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

