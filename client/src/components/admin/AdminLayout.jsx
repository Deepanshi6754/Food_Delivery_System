import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopHeader from './AdminTopHeader';
import '../../styles/admin.css';

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="admin-main">
        <AdminTopHeader onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
