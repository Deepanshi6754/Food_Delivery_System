import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import OwnerSidebar from './OwnerSidebar';
import OwnerTopHeader from './OwnerTopHeader';
import { loadOwnerMe } from '../../features/owner/ownerAuthSlice';
import { getSocket } from '../../services/socket';
import ownerApi from '../../services/ownerApi';
import '../../styles/owner.css';

export default function OwnerLayout() {
  const dispatch = useDispatch();
  const { restaurant } = useSelector((state) => state.ownerAuth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [toastAlert, setToastAlert] = useState(null);

  // Load owner restaurant data
  useEffect(() => {
    dispatch(loadOwnerMe());

    // Fetch initial pending orders count
    const fetchCounts = async () => {
      try {
        const res = await ownerApi.get('/orders');
        if (res.data?.counts) {
          setPendingOrdersCount(res.data.counts.placed + res.data.counts.confirmed);
        }
      } catch (err) {
        // silent
      }
    };
    fetchCounts();
  }, [dispatch]);

  // Real-time Socket.IO events for restaurant room
  useEffect(() => {
    const socket = getSocket();
    if (restaurant?._id) {
      socket.emit('join_restaurant_room', restaurant._id);

      const handleOrderUpdate = (order) => {
        // Show live toast banner
        setToastAlert(`🔔 Order #${order.orderNumber} updated to ${order.orderStatus.replace(/_/g, ' ')}`);
        setTimeout(() => setToastAlert(null), 5000);

        setNotifications((prev) => [
          {
            title: `Order Update #${order.orderNumber}`,
            message: `Status is now ${order.orderStatus.replace(/_/g, ' ')}`
          },
          ...prev.slice(0, 9)
        ]);

        // Refresh counts
        ownerApi.get('/orders').then((res) => {
          if (res.data?.counts) {
            setPendingOrdersCount(res.data.counts.placed + res.data.counts.confirmed);
          }
        }).catch(() => {});
      };

      socket.on('order_updated', handleOrderUpdate);

      return () => {
        socket.emit('leave_restaurant_room', restaurant._id);
        socket.off('order_updated', handleOrderUpdate);
      };
    }
  }, [restaurant?._id]);

  return (
    <div className="owner-layout">
      {/* Toast Alert Banner */}
      {toastAlert && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#292524',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: '0.9rem',
            borderLeft: '4px solid #F97316',
            animation: 'slideIn 0.3s ease'
          }}
        >
          {toastAlert}
        </div>
      )}

      {/* Sidebar Navigation */}
      <OwnerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Area */}
      <div className="owner-main-wrapper">
        <OwnerTopHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          onClearNotification={() => setNotifications([])}
        />

        <main className="owner-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

