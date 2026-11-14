import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import HomePage from '../pages/Home/HomePage';
import RestaurantsPage from '../pages/Restaurants/RestaurantsPage';
import RestaurantDetailsPage from '../pages/RestaurantDetails/RestaurantDetailsPage';
import CartPage from '../pages/Cart/CartPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import OrderTrackingPage from '../pages/OrderTracking/OrderTrackingPage';
import MyOrdersPage from '../pages/MyOrders/MyOrdersPage';
import WishlistPage from '../pages/Wishlist/WishlistPage';
import OffersPage from '../pages/Offers/OffersPage';
import SupportPage from '../pages/Support/SupportPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPassword/ResetPasswordPage';

// Module 02: Restaurant Owner Portal Pages
import OwnerLayout from '../components/owner/OwnerLayout';
import OwnerProtectedRoute from '../components/owner/OwnerProtectedRoute';
import OwnerLoginPage from '../pages/Owner/OwnerLoginPage';
import OwnerRegisterPage from '../pages/Owner/OwnerRegisterPage';
import OwnerDashboardPage from '../pages/Owner/OwnerDashboardPage';
import OwnerOrdersPage from '../pages/Owner/OwnerOrdersPage';
import OwnerMenuPage from '../pages/Owner/OwnerMenuPage';
import OwnerFoodFormPage from '../pages/Owner/OwnerFoodFormPage';
import OwnerRestaurantPage from '../pages/Owner/OwnerRestaurantPage';
import OwnerReviewsPage from '../pages/Owner/OwnerReviewsPage';
import OwnerPromotionsPage from '../pages/Owner/OwnerPromotionsPage';
import OwnerEarningsPage from '../pages/Owner/OwnerEarningsPage';
import OwnerSettingsPage from '../pages/Owner/OwnerSettingsPage';

// Module 03: Delivery Rider Portal Pages
import RiderLayout from '../components/rider/RiderLayout';
import RiderProtectedRoute from '../components/rider/RiderProtectedRoute';
import RiderLoginPage from '../pages/Rider/RiderLoginPage';
import RiderRegisterPage from '../pages/Rider/RiderRegisterPage';
import RiderDashboardPage from '../pages/Rider/RiderDashboardPage';
import RiderDeliveriesPage from '../pages/Rider/RiderDeliveriesPage';
import RiderActiveDeliveryPage from '../pages/Rider/RiderActiveDeliveryPage';
import RiderHistoryPage from '../pages/Rider/RiderHistoryPage';
import RiderEarningsPage from '../pages/Rider/RiderEarningsPage';
import RiderProfilePage from '../pages/Rider/RiderProfilePage';
import RiderSettingsPage from '../pages/Rider/RiderSettingsPage';

// Module 04: System Admin Portal Pages
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import AdminLoginPage from '../pages/Admin/AdminLoginPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import AdminCustomersPage from '../pages/Admin/AdminCustomersPage';
import AdminCustomerDetailPage from '../pages/Admin/AdminCustomerDetailPage';
import AdminRestaurantsPage from '../pages/Admin/AdminRestaurantsPage';
import AdminRidersPage from '../pages/Admin/AdminRidersPage';
import AdminOrdersPage from '../pages/Admin/AdminOrdersPage';
import AdminFinancePage from '../pages/Admin/AdminFinancePage';
import AdminCategoriesPage from '../pages/Admin/AdminCategoriesPage';
import AdminMenuModerationPage from '../pages/Admin/AdminMenuModerationPage';
import AdminCouponsPage from '../pages/Admin/AdminCouponsPage';
import AdminReviewsPage from '../pages/Admin/AdminReviewsPage';
import AdminSupportPage from '../pages/Admin/AdminSupportPage';
import AdminAnnouncementsPage from '../pages/Admin/AdminAnnouncementsPage';
import AdminReportsPage from '../pages/Admin/AdminReportsPage';
import AdminSettingsPage from '../pages/Admin/AdminSettingsPage';
import AdminAuditLogsPage from '../pages/Admin/AdminAuditLogsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/restaurants" element={<RestaurantsPage />} />
      <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/offers" element={<OffersPage />} />
      <Route path="/support" element={<SupportPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected Customer Routes */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId/track"
        element={
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Module 02: Restaurant Owner Portal Routes */}
      <Route path="/owner/login" element={<OwnerLoginPage />} />
      <Route path="/owner/register" element={<OwnerRegisterPage />} />
      <Route
        path="/owner"
        element={
          <OwnerProtectedRoute>
            <OwnerLayout />
          </OwnerProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboardPage />} />
        <Route path="orders" element={<OwnerOrdersPage />} />
        <Route path="menu" element={<OwnerMenuPage />} />
        <Route path="menu/add" element={<OwnerFoodFormPage />} />
        <Route path="menu/edit/:id" element={<OwnerFoodFormPage />} />
        <Route path="restaurant" element={<OwnerRestaurantPage />} />
        <Route path="reviews" element={<OwnerReviewsPage />} />
        <Route path="promotions" element={<OwnerPromotionsPage />} />
        <Route path="earnings" element={<OwnerEarningsPage />} />
        <Route path="settings" element={<OwnerSettingsPage />} />
      </Route>

      {/* Module 03: Delivery Rider Portal Routes */}
      <Route path="/rider/login" element={<RiderLoginPage />} />
      <Route path="/rider/register" element={<RiderRegisterPage />} />
      <Route
        path="/rider"
        element={
          <RiderProtectedRoute>
            <RiderLayout />
          </RiderProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/rider/dashboard" replace />} />
        <Route path="dashboard" element={<RiderDashboardPage />} />
        <Route path="deliveries" element={<RiderDeliveriesPage />} />
        <Route path="delivery/active" element={<RiderActiveDeliveryPage />} />
        <Route path="history" element={<RiderHistoryPage />} />
        <Route path="earnings" element={<RiderEarningsPage />} />
        <Route path="profile" element={<RiderProfilePage />} />
        <Route path="settings" element={<RiderSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
