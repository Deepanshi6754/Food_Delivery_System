import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import RiderSidebar from './RiderSidebar';
import RiderBottomNav from './RiderBottomNav';
import RiderTopHeader from './RiderTopHeader';
import { loadRiderMe, setRiderProfile } from '../../features/rider/riderAuthSlice';
import riderApi from '../../services/riderApi';
import '../../styles/rider.css';

const PAGE_TITLES = {
  '/rider/dashboard': { title: 'Dashboard', subtitle: 'Your delivery overview' },
  '/rider/deliveries': { title: 'Deliveries', subtitle: 'Incoming requests & active orders' },
  '/rider/delivery/active': { title: 'Active Delivery', subtitle: 'Current delivery in progress' },
  '/rider/history': { title: 'Delivery History', subtitle: 'Past deliveries & records' },
  '/rider/earnings': { title: 'Earnings', subtitle: 'Payments & withdrawals' },
  '/rider/profile': { title: 'My Profile', subtitle: 'Personal & vehicle info' },
  '/rider/settings': { title: 'Settings', subtitle: 'Preferences & security' },
};

export default function RiderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.riderAuth);

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Rider Portal', subtitle: '' };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadRiderMe());
      // Load rider profile
      riderApi.get('/profile').then(({ data }) => {
        if (data?.data) dispatch(setRiderProfile(data.data));
      }).catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="rider-layout">
      <RiderSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="rider-main-content">
        <RiderTopHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="rider-page-content">
          <Outlet />
        </main>
      </div>

      <RiderBottomNav />
    </div>
  );
}
