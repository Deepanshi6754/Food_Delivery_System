import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { isAuthenticated, admin, token } = useSelector((state) => state.adminAuth);

  const activeToken = token || localStorage.getItem('admin_token');

  if (!isAuthenticated && !activeToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role authorization if restricted
  if (allowedRoles && allowedRoles.length > 0) {
    const role = admin?.adminRole || 'super_admin';
    if (role !== 'super_admin' && !allowedRoles.includes(role)) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: '#DC2626' }}>Access Restricted</h2>
          <p style={{ color: '#78716C' }}>
            Your administrator role ({role}) does not have permission to view this section.
          </p>
        </div>
      );
    }
  }

  return children;
}
