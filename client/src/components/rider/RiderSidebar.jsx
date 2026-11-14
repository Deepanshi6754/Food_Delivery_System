import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, Navigation, Clock, DollarSign,
  User, Settings, LogOut, Bike, ChevronRight
} from 'lucide-react';
import { riderLogout, toggleRiderAvailability } from '../../features/rider/riderAuthSlice';

const navItems = [
  { to: '/rider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rider/deliveries', icon: Package, label: 'Deliveries' },
  { to: '/rider/delivery/active', icon: Navigation, label: 'Active Delivery' },
  { to: '/rider/history', icon: Clock, label: 'History' },
  { to: '/rider/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/rider/profile', icon: User, label: 'Profile' },
  { to: '/rider/settings', icon: Settings, label: 'Settings' },
];

export default function RiderSidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { riderProfile } = useSelector((state) => state.riderAuth);
  const isOnline = riderProfile?.isOnline ?? false;

  const handleLogout = () => {
    dispatch(riderLogout());
    navigate('/rider/login');
  };

  const handleToggle = () => {
    dispatch(toggleRiderAvailability());
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`rider-sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`rider-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="rider-sidebar-logo">
          <div className="rider-sidebar-logo-icon">
            <Bike size={18} />
          </div>
          <div>
            <div className="rider-sidebar-logo-text">FoodDelight</div>
            <div className="rider-sidebar-logo-sub">Rider Portal</div>
          </div>
        </div>

        {/* Online/Offline Toggle */}
        <button
          className={`rider-status-badge ${isOnline ? 'online' : 'offline'}`}
          onClick={handleToggle}
        >
          <span className="rider-status-dot" />
          <span style={{ flex: 1, textAlign: 'left' }}>
            {isOnline ? 'Online — Available' : 'Offline'}
          </span>
          <ChevronRight size={14} />
        </button>

        {/* Navigation */}
        <nav className="rider-sidebar-nav">
          <div className="rider-nav-section-title">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `rider-nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="rider-sidebar-footer">
          <button className="rider-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
