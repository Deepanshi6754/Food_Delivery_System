import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RiderProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.riderAuth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/rider/login" state={{ from: location }} replace />;
  }

  return children;
}
