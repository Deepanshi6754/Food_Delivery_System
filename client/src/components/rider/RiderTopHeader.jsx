import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { riderLogout } from '../../features/rider/riderAuthSlice';

export default function RiderTopHeader({ title, subtitle, onMenuToggle }) {
  const { user } = useSelector((state) => state.riderAuth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(riderLogout());
    navigate('/rider/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'R';

  return (
    <header className="rider-header">
      <div className="rider-header-left">
        <button className="rider-mobile-menu-btn" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div>
          {title && <div className="rider-header-title">{title}</div>}
          {subtitle && <div className="rider-header-subtitle">{subtitle}</div>}
        </div>
      </div>

      <div className="rider-header-right">
        <button className="rider-header-notif-btn">
          <Bell size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="rider-header-avatar" />
          ) : (
            <div className="rider-header-avatar-placeholder">{initials}</div>
          )}
          <div style={{ display: 'none' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--rider-text)' }}>{user?.name}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid var(--rider-border)',
            background: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'var(--rider-error)'
          }}
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
