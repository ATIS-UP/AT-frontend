import React from 'react';
import { Navigate } from 'react-router-dom';
import { Rol } from '../../shared/types/roles.types';
import { useAuthStore } from '../../features/auth/store/auth.store';

interface RoleGuardProps {
  allowedRoles: Rol[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const rol = user?.rol ?? null;
  if (!rol || !allowedRoles.includes(rol)) {
    return fallback ? <>{fallback}</> : <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}