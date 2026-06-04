import { useAuthStore } from '@/store/authStore';

const ADMIN_ROL = 'admin';

export function usePermisos() {
  const usuario = useAuthStore((s) => s.usuario);
  const permisos = usuario?.permisos ?? [];
  const isAdmin = usuario?.rol === ADMIN_ROL;

  const hasPermiso = (modulo: string, accion: string): boolean => {
    if (isAdmin) return true;
    return permisos.includes(`${modulo}.${accion}`);
  };

  const hasAnyPermiso = (...pairs: Array<[string, string]>): boolean => {
    if (isAdmin) return true;
    return pairs.some(([m, a]) => permisos.includes(`${m}.${a}`));
  };

  const hasAllPermisos = (...pairs: Array<[string, string]>): boolean => {
    if (isAdmin) return true;
    return pairs.every(([m, a]) => permisos.includes(`${m}.${a}`));
  };

  const isModuloVisible = (modulo: string): boolean => {
    if (isAdmin) return true;
    return permisos.some((p) => p.startsWith(`${modulo}.`));
  };

  return {
    permisos,
    isAdmin,
    hasPermiso,
    hasAnyPermiso,
    hasAllPermisos,
    isModuloVisible,
  };
}
