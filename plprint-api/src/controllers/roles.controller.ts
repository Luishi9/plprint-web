import { Request, Response, NextFunction } from 'express';
import { RolesService } from '../services/roles.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class RolesController {
  constructor(private rolesService: RolesService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.rolesService.findAll();
      sendSuccess(res, roles);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = await this.rolesService.findById(Number(req.params.id));
      sendSuccess(res, rol);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = await this.rolesService.create(req.body);
      sendCreated(res, rol);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = await this.rolesService.update(Number(req.params.id), req.body);
      sendSuccess(res, rol);
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
