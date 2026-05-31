import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

// Roles del sistema (deben coincidir con los IDs en la tabla roles)
export const ROLES = {
  ADMIN: 1,
  VENDEDOR: 2,
  OPERADOR: 3,
} as const;

export type RolId = (typeof ROLES)[keyof typeof ROLES];

/**
 * Middleware RBAC: verifica que el usuario tenga uno de los roles permitidos.
 * Debe usarse DESPUES de authenticate.
 */
export const authorize = (...rolesPermitidos: RolId[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRol = req.user?.rolId;

    if (!userRol || !rolesPermitidos.includes(userRol as RolId)) {
      return next(new ForbiddenError('No tienes permisos para esta accion'));
    }

    next();
  };
};

/**
 * Verifica que el usuario tenga acceso a la sucursal solicitada.
 * El admin (rol 1) tiene acceso a todas.
 */
export const authorizeSucursal = (req: Request, _res: Response, next: NextFunction): void => {
  const user = req.user;
  const sucursalId = Number(req.params.sucursalId ?? req.body.sucursalId ?? req.query.sucursalId);

  if (!user) return next(new ForbiddenError());

  const esAdmin = user.rolId === ROLES.ADMIN;
  const tieneSucursal = user.sucursales.includes(sucursalId);

  if (!sucursalId || esAdmin || tieneSucursal) {
    return next();
  }

  next(new ForbiddenError('No tienes acceso a esta sucursal'));
};
