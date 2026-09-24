import React from "react";
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FullScreenLoader from '../components/common/FullScreenLoader';

/**
 * Route guard that checks if:
 * 1. User is authenticated
 * 2. User has the required role (if specified)
 * 3. Renders children if both pass, otherwise redirects to login
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User is authenticated but doesn't have the required role
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
