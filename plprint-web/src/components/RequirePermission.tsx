import type { ReactNode } from 'react';
import { usePermisos } from '@/hooks/usePermisos';

type PermisoPair = [string, string];

interface Props {
  modulo: string;
  accion: string;
  children: ReactNode;
  fallback?: ReactNode;
  /** Si true, oculta en lugar de mostrar fallback cuando no tiene permiso */
  hide?: boolean;
  /** Si se pasan multiples permisos, se requiere AL MENOS uno (OR) */
  anyOf?: PermisoPair[];
  /** Si se pasan multiples permisos, se requieren TODOS (AND) */
  allOf?: PermisoPair[];
}

export function RequirePermission({
  modulo,
  accion,
  children,
  fallback = null,
  hide = false,
  anyOf,
  allOf,
}: Props) {
  const { isAdmin, hasPermiso, hasAnyPermiso, hasAllPermisos } = usePermisos();

  let allowed: boolean;
  if (anyOf && anyOf.length > 0) {
    allowed = isAdmin || hasAnyPermiso(...anyOf);
  } else if (allOf && allOf.length > 0) {
    allowed = isAdmin || hasAllPermisos(...allOf);
  } else {
    allowed = hasPermiso(modulo, accion);
  }

  if (allowed) return <>{children}</>;
  if (hide) return null;
  return <>{fallback}</>;
}
