import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  UtensilsCrossed,
  MapPin,
  Search,
  ShoppingBag,
  Heart,
  User,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Tag,
  HelpCircle,
  Clock
} from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebar } from '../../features/cart/cartSlice';
import { markAsRead, markAllAsRead } from '../../features/notifications/notificationSlice';

export default function Navbar({ onOpenLocationModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const { restaurants, menuItems } = useSelector((state) => state.wishlist);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem('user_location') || 'Connaught Place, New Delhi'
  );

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWishlistCount = (restaurants?.length || 0) + (menuItems?.length || 0);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <UtensilsCrossed size={22} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <span>Food</span>
            <span className="text-orange">Delight</span>
          </div>
        </Link>

        {/* Location Selector */}
        <button
          className="location-pill"
          onClick={onOpenLocationModal}
          title="Change delivery location"
        >
          <div className="location-icon-wrapper">
            <MapPin size={16} className="text-orange" />
          </div>
          <div className="location-text-group">
            <span className="location-label">Deliver to</span>
            <span className="location-value">{selectedLocation}</span>
          </div>
          <ChevronDown size={14} className="text-muted" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/restaurants"
            className={`nav-link ${location.pathname.startsWith('/restaurants') ? 'active' : ''}`}
          >
            Explore
          </Link>
          <Link
            to="/offers"
            className={`nav-link ${location.pathname === '/offers' ? 'active' : ''}`}
          >
            Offers
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* Wishlist Link */}
          <Link to="/wishlist" className="action-btn" title="My Wishlist">
            <Heart size={20} />
            {totalWishlistCount > 0 && (
              <span className="badge-count wishlist-badge">{totalWishlistCount}</span>
            )}
          </Link>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="dropdown-wrapper" ref={notifRef}>
              <button
                className="action-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="badge-count notif-badge">{unreadCount}</span>
                )}
              </button>

              {isNotifOpen && (
                <div className="dropdown-menu notif-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-title">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        className="btn-mark-all"
                        onClick={() => dispatch(markAllAsRead())}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={() => {
                            if (!n.isRead) dispatch(markAsRead(n._id));
                            if (n.link) navigate(n.link);
                            setIsNotifOpen(false);
                          }}
                        >
                          <div className="notif-title-row">
                            <span className="notif-item-title">{n.title}</span>
                            <span className="notif-time">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="notif-message">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty">No notifications yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Trigger */}
          <button
            className="cart-trigger-btn"
            onClick={() => dispatch(toggleSidebar())}
            title="View Cart"
          >
            <div className="cart-icon-box">
              <ShoppingBag size={18} />
              {totalCartCount > 0 && (
                <span className="cart-badge-count">{totalCartCount}</span>
              )}
            </div>
            <span className="cart-label">Cart</span>
          </button>

          {/* Auth State / Profile Dropdown */}
          {isAuthenticated && user ? (
            <div className="dropdown-wrapper" ref={profileRef}>
              <button
                className="profile-trigger-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="profile-avatar"
                />
                <span className="profile-name">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {isProfileOpen && (
                <div className="dropdown-menu profile-dropdown">
                  <div className="profile-info-header">
                    <p className="user-fullname">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/my-orders"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Package size={16} />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/profile?tab=addresses"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <MapPin size={16} />
                    <span>Saved Addresses</span>
                  </Link>
                  <Link
                    to="/offers"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Tag size={16} />
                    <span>Coupons & Offers</span>
                  </Link>
                  <Link
                    to="/support"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/owner/login" className="btn btn-ghost btn-sm" style={{ color: '#F97316', fontWeight: 700 }}>
                Owner
              </Link>
              <Link to="/rider/login" className="btn btn-ghost btn-sm" style={{ color: '#EA580C', fontWeight: 700 }}>
                Rider
              </Link>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <Link to="/" className="mobile-nav-link">
              Home
            </Link>
            <Link to="/restaurants" className="mobile-nav-link">
              Explore Restaurants
            </Link>
            <Link to="/offers" className="mobile-nav-link">
              Offers & Deals
            </Link>
            <Link to="/wishlist" className="mobile-nav-link">
              Wishlist ({totalWishlistCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/my-orders" className="mobile-nav-link">
                  My Orders
                </Link>
                <Link to="/profile" className="mobile-nav-link">
                  My Profile
                </Link>
                <Link to="/support" className="mobile-nav-link">
                  Help & Support
                </Link>
                <button
                  className="mobile-nav-link text-danger logout-btn"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-row">
                <Link to="/login" className="btn btn-outline" style={{ flex: 1 }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

