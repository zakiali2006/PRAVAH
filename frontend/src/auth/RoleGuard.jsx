import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // If no user is logged in, kick them to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but role doesn't match the required role
  const hasAccess = allowedRoles.includes(currentUser.role);
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render children or Outlet if used as layout
  return children ? children : <Outlet />;
};
