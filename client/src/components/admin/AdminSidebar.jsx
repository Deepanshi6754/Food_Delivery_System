import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Store,
  Bike,
  ShoppingBag,
  DollarSign,
  Grid,
  UtensilsCrossed,
  Tag,
  Star,
  LifeBuoy,
  Bell,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) {
  const { admin } = useSelector((state) => state.adminAuth);
  const role = admin?.adminRole || 'super_admin';

  const roleLabel = {
    super_admin: 'Super Admin',
    operations_admin: 'Ops Admin',
    finance_admin: 'Finance Admin',
    support_admin: 'Support Admin'
  }[role] || 'Admin';

  const navSections = [
    {
      title: 'Core Platform',
      items: [
        { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Live Orders', to: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers', to: '/admin/customers', icon: Users },
        { label: 'Restaurants', to: '/admin/restaurants', icon: Store },
        { label: 'Delivery Riders', to: '/admin/riders', icon: Bike }
      ]
    },
    {
      title: 'Finance & Revenue',
      items: [
        { label: 'Finance & Payouts', to: '/admin/finance', icon: DollarSign },
        { label: 'Analytics Reports', to: '/admin/reports', icon: BarChart3 }
      ]
    },
    {
      title: 'Catalogue & Content',
      items: [
        { label: 'Food Categories', to: '/admin/categories', icon: Grid },
        { label: 'Menu Moderation', to: '/admin/menu', icon: UtensilsCrossed },
        { label: 'Coupons & Deals', to: '/admin/coupons', icon: Tag },
        { label: 'Customer Reviews', to: '/admin/reviews', icon: Star }
      ]
    },
    {
      title: 'Operations & Support',
      items: [
        { label: 'Support Tickets', to: '/admin/support', icon: LifeBuoy },
        { label: 'Announcements', to: '/admin/announcements', icon: Bell }
      ]
    },
    {
      title: 'Governance',
      items: [
        { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
        { label: 'Security Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert }
      ]
    }
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <Link to="/admin/dashboard" className="admin-brand">
          <div className="admin-brand-icon">FD</div>
          {!isCollapsed && (
            <div>
              <span>FoodDelight</span>
              <span className="admin-brand-badge">{roleLabel}</span>
            </div>
          )}
        </Link>
        <button
          className="admin-icon-btn hidden md:flex"
          style={{ width: '28px', height: '28px' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="admin-sidebar-nav">
        {navSections.map((section, idx) => (
          <div key={idx} className="admin-nav-section">
            {!isCollapsed && <div className="admin-nav-section-title">{section.title}</div>}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-pill">
          <img
            src={admin?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
            alt={admin?.name || 'Admin'}
            className="admin-user-avatar"
          />
          {!isCollapsed && (
            <div className="admin-user-info">
              <span className="admin-user-name">{admin?.name || 'Administrator'}</span>
              <span className="admin-user-role">{roleLabel}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
