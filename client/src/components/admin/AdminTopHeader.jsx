import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logoutAdmin } from '../../features/admin/adminAuthSlice';
import adminApi from '../../services/adminApi';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  ExternalLink,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AdminTopHeader({ onToggleMobile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.adminAuth);

  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await adminApi.get('/notifications/alerts');
        if (res.data.success) {
          setAlerts(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load operational alerts:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 45000); // Polling every 45s

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAlerts(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="admin-top-header">
      {/* Left: Mobile Toggle & Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="admin-icon-btn md:hidden"
          onClick={onToggleMobile}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="admin-header-search">
          <Search size={16} color="#78716C" />
          <input
            type="text"
            placeholder="Search orders, customers, restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right: Actions */}
      <div className="admin-header-actions" ref={dropdownRef}>
        {/* View Customer App */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="admin-btn admin-btn-secondary admin-btn-sm hidden sm:inline-flex"
          title="Open live customer portal in new tab"
        >
          <ExternalLink size={14} />
          <span>Live Store</span>
        </a>

        {/* Operational Alerts Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="admin-icon-btn"
            onClick={() => setShowAlerts(!showAlerts)}
            title="Operational Alerts"
          >
            <Bell size={18} />
            {alerts.length > 0 && <span className="admin-badge-count">{alerts.length}</span>}
          </button>

          {showAlerts && (
            <div className="admin-alerts-dropdown">
              <div className="admin-alerts-header">
                <span>Platform Alerts ({alerts.length})</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowAlerts(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="admin-alert-list">
                {alerts.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#78716C', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={24} color="#15803D" style={{ margin: '0 auto 0.5rem' }} />
                    All platform operations running normal!
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <Link
                      key={alert.id}
                      to={alert.link}
                      className="admin-alert-item"
                      onClick={() => setShowAlerts(false)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <AlertTriangle
                          size={14}
                          color={alert.level === 'danger' ? '#DC2626' : '#D97706'}
                        />
                        <strong style={{ fontSize: '0.8rem', color: '#292524' }}>{alert.title}</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#78716C', lineHeight: 1.3 }}>
                        {alert.message}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={handleLogout}
          title="Sign out of Admin Session"
        >
          <LogOut size={15} color="#DC2626" />
          <span className="hidden sm:inline" style={{ color: '#DC2626' }}>Logout</span>
        </button>
      </div>
    </header>
  );
}
