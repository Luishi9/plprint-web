import { Request, Response, NextFunction } from 'express';
import { ComprasService } from '../services/compras.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class ComprasController {
  constructor(private comprasService: ComprasService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const fechaDesde = req.query.fechaDesde as string | undefined;
      const fechaHasta = req.query.fechaHasta as string | undefined;
      const proveedorId = req.query.proveedorId ? Number(req.query.proveedorId) : undefined;
      const insumoId = req.query.insumoId ? Number(req.query.insumoId) : undefined;
      const sucursalId = req.query.sucursalId ? Number(req.query.sucursalId) : undefined;
      const { data, total, totalInvertido, totalCantidad } = await this.comprasService.findAll({
        page, limit, search, fechaDesde, fechaHasta, proveedorId, insumoId, sucursalId,
      });
      sendSuccess(res, data, 200, {
        ...buildPaginationMeta(total, page, limit),
        totalInvertido: Number(totalInvertido),
        totalCantidad: Number(totalCantidad),
      });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const c = await this.comprasService.findById(Number(req.params.id));
      sendSuccess(res, c);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = { ...req.body, usuario_id: req.body.usuario_id || req.user?.sub };
      const c = await this.comprasService.create(dto);
      sendCreated(res, c);
    } catch (err) { next(err); }
  };

  createBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = { ...req.body, usuario_id: req.user?.sub };
      const result = await this.comprasService.createBatch(dto);
      sendCreated(res, result);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.comprasService.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) { next(err); }
  };
}
