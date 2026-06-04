import { Request, Response, NextFunction } from 'express';
import { ProveedoresService } from '../services/proveedores.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class ProveedoresController {
  constructor(private proveedoresService: ProveedoresService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const { data, total } = await this.proveedoresService.findAll({ page, limit, search });
      sendSuccess(res, data, 200, buildPaginationMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const proveedor = await this.proveedoresService.findById(Number(req.params.id));
      sendSuccess(res, proveedor);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const proveedor = await this.proveedoresService.create(req.body);
      sendCreated(res, proveedor);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const proveedor = await this.proveedoresService.update(Number(req.params.id), req.body);
      sendSuccess(res, proveedor);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.proveedoresService.softDelete(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
