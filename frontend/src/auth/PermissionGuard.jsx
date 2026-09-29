import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Renders children only if the current user has the required permission(s).
 * If requireAll is true, the user must have all listed permissions.
 * If requireAll is false, the user must have at least one of the listed permissions.
 */
export const PermissionGuard = ({ permissions, requireAll = false, fallback = null, children }) => {
  const { currentUser, loading } = useAuth();

  if (loading || !currentUser) {
    return fallback;
  }

  const userPerms = currentUser.permissions || [];
  
  // Ensure permissions is an array
  const permsToCheck = Array.isArray(permissions) ? permissions : [permissions];

  const hasAccess = requireAll 
    ? permsToCheck.every(p => userPerms.includes(p))
    : permsToCheck.some(p => userPerms.includes(p));

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};
