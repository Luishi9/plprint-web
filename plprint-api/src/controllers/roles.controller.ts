import { Request, Response, NextFunction } from 'express';
import { RolesService } from '../services/roles.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

const flattenPermisos = (rol: any) => {
  if (!rol) return rol;
  const permisos = (rol.rol_permisos ?? [])
    .map((rp: any) => rp.permisos)
    .filter(Boolean);
  const { rol_permisos, ...rest } = rol;
  return { ...rest, permisos };
};

export class RolesController {
  constructor(private rolesService: RolesService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.rolesService.findAll();
      sendSuccess(res, roles.map(flattenPermisos));
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = await this.rolesService.findById(Number(req.params.id));
      sendSuccess(res, flattenPermisos(rol));
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = await this.rolesService.create(req.body);
      sendCreated(res, flattenPermisos(rol));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = await this.rolesService.update(Number(req.params.id), req.body);
      sendSuccess(res, flattenPermisos(rol));
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.rolesService.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  getAllPermisos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permisos = await this.rolesService.findAllPermisos();
      sendSuccess(res, permisos);
    } catch (err) {
      next(err);
    }
  };
}
