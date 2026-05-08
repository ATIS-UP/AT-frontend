import React from 'react';
import { Navigate } from 'react-router-dom';
import { Rol } from '../../shared/types/roles.types';
import { useAuthStore } from '../../features/auth/store/authStore';

interface RoleGuardProps {
  allowedRoles: Rol[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { rol, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!rol || !allowedRoles.includes(rol)) {
    return fallback ? <>{fallback}</> : <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}