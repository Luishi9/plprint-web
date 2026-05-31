import { Request, Response, NextFunction } from 'express';
import { SucursalesService } from '../services/sucursales.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class SucursalesController {
  constructor(private sucursalesService: SucursalesService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursales = await this.sucursalesService.findAll();
      sendSuccess(res, sucursales);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursal = await this.sucursalesService.findById(Number(req.params.id));
      sendSuccess(res, sucursal);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursal = await this.sucursalesService.create(req.body);
      sendCreated(res, sucursal);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursal = await this.sucursalesService.update(Number(req.params.id), req.body);
      sendSuccess(res, sucursal);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.sucursalesService.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
