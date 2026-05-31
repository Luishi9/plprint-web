import { Request, Response, NextFunction } from 'express';
import { VentasService } from '../services/ventas.service';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../utils/response';

export class VentasController {
  constructor(private ventasService: VentasService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const sucursalId = req.query.sucursalId ? Number(req.query.sucursalId) : undefined;
      const desde = req.query.desde as string | undefined;
      const hasta = req.query.hasta as string | undefined;

      const { data, total } = await this.ventasService.findAll({
        page, limit, sucursalId, desde, hasta,
        usuarioId: req.user!.rolId !== 1 ? req.user!.sub : undefined,
        sucursalesPermitidas: req.user!.sucursales,
      });
      sendSuccess(res, data, 200, buildPaginationMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const venta = await this.ventasService.findById(Number(req.params.id));
      sendSuccess(res, venta);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const venta = await this.ventasService.create({
        ...req.body,
        usuarioId: req.user!.sub,
      });
      sendCreated(res, venta);
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const venta = await this.ventasService.cancel(Number(req.params.id), req.user!.sub);
      sendSuccess(res, venta);
    } catch (err) {
      next(err);
    }
  };
}
