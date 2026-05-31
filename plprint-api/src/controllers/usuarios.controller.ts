import { Request, Response, NextFunction } from 'express';
import { UsuariosService } from '../services/usuarios.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarios = await this.usuariosService.findAll();
      sendSuccess(res, usuarios);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = await this.usuariosService.findById(Number(req.params.id));
      sendSuccess(res, usuario);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = await this.usuariosService.create(req.body);
      sendCreated(res, usuario);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = await this.usuariosService.update(Number(req.params.id), req.body);
      sendSuccess(res, usuario);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.usuariosService.softDelete(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  asignarSucursal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.usuariosService.asignarSucursal(
        Number(req.params.id),
        req.body.sucursalId,
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  removerSucursal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.usuariosService.removerSucursal(
        Number(req.params.id),
        Number(req.params.sucursalId),
      );
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
