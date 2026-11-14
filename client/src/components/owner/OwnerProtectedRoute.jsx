import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function OwnerProtectedRoute({ children }) {
  const { isAuthenticated, token } = useSelector((state) => state.ownerAuth);

  const storedToken = localStorage.getItem('owner_token');

  if (!isAuthenticated && !storedToken) {
    return <Navigate to="/owner/login" replace />;
  }

  return children;
}

