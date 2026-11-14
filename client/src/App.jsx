import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartSidebar from './components/cart/CartSidebar';
import CartConflictModal from './components/cart/CartConflictModal';
import LocationModal from './components/common/LocationModal';
import { loadMe } from './features/auth/authSlice';
import { fetchCart } from './features/cart/cartSlice';
import { fetchWishlist } from './features/wishlist/wishlistSlice';
import { fetchNotifications, addSocketNotification } from './features/notifications/notificationSlice';
import { getSocket } from './services/socket';

function AppContent() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isRiderRoute = location.pathname.startsWith('/rider');
  const isPortalRoute = isOwnerRoute || isRiderRoute;

  // Customer Portal state hydration
  useEffect(() => {
    if (!isPortalRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        dispatch(loadMe());
        dispatch(fetchCart());
        dispatch(fetchWishlist());
        dispatch(fetchNotifications());
      }
    }

    // Custom Toast Event Listener
    const handleToast = (e) => {
      setToastMessage(e.detail);
      setTimeout(() => setToastMessage(''), 3500);
    };
    window.addEventListener('show_toast', handleToast);

    // Socket.IO Listener for customer notifications
    const socket = getSocket();
    const handleNotification = (notif) => {
      dispatch(addSocketNotification(notif));
      setToastMessage(`🔔 ${notif.title}: ${notif.message}`);
      setTimeout(() => setToastMessage(''), 4500);
    };
    socket.on('new_notification', handleNotification);

    return () => {
      window.removeEventListener('show_toast', handleToast);
      socket.off('new_notification', handleNotification);
    };
  }, [dispatch, isPortalRoute]);

  useEffect(() => {
    if (isAuthenticated && !isPortalRoute) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, isPortalRoute, dispatch]);

  // If in Owner or Rider Portal, render routes cleanly without customer navbar/footer/cart drawer
  if (isPortalRoute) {
    return <AppRoutes />;
  }

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar onOpenLocationModal={() => setIsLocationModalOpen(true)} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="global-toast-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Routed Content */}
      <main className="main-content">
        <AppRoutes />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Cart Drawer & Modals */}
      <CartSidebar />
      <CartConflictModal />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={() => window.location.reload()}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
