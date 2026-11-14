import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Clock, DollarSign, User } from 'lucide-react';

const tabs = [
  { to: '/rider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rider/deliveries', icon: Package, label: 'Deliveries' },
  { to: '/rider/history', icon: Clock, label: 'History' },
  { to: '/rider/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/rider/profile', icon: User, label: 'Profile' },
];

export default function RiderBottomNav() {
  return (
    <nav className="rider-bottom-nav">
      <div className="rider-bottom-nav-inner">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `rider-bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
