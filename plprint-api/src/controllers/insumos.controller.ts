import { Request, Response, NextFunction } from 'express';
import { InsumosService } from '../services/insumos.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class InsumosController {
  constructor(private insumosService: InsumosService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;

      const { data, total } = await this.insumosService.findAll({ page, limit, search });
      const meta = buildPaginationMeta(total, page, limit);
      sendSuccess(res, data, 200, meta);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const insumo = await this.insumosService.findById(Number(req.params.id));
      sendSuccess(res, insumo);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const insumo = await this.insumosService.create(req.body);
      sendCreated(res, insumo);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const insumo = await this.insumosService.update(Number(req.params.id), req.body);
      sendSuccess(res, insumo);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.insumosService.softDelete(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  getInventarioBySucursal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = Number(req.params.sucursalId);
      const search = req.query.search as string | undefined;
      const inventario = await this.insumosService.getInventarioBySucursal(sucursalId, search);
      sendSuccess(res, inventario);
    } catch (err) {
      next(err);
    }
  };

  ajustarStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { insumoId, sucursalId, cantidad, tipo } = req.body;
      const resultado = await this.insumosService.ajustarStock(insumoId, sucursalId, cantidad, tipo);
      sendSuccess(res, resultado);
    } catch (err) {
      next(err);
    }
  };
}
