import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePermisos } from '@/hooks/usePermisos';

interface Props {
  allowedRoles?: string[];
  requiredPermission?: [string, string];
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, requiredPermission, children }: Props) => {
  const { isAuthenticated, usuario } = useAuthStore();
  const { hasPermiso } = usePermisos();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && usuario?.rol && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !hasPermiso(requiredPermission[0], requiredPermission[1])) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
