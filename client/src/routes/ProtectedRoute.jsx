import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  const token = localStorage.getItem('token');

  if (!isAuthenticated && !token && !loading) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
}

