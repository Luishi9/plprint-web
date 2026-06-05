import { Request, Response, NextFunction } from 'express';
import { MaquinasService } from '../services/maquinas.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class MaquinasController {
  constructor(private service: MaquinasService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const search = req.query.search as string | undefined;
      const sucursalId = req.query.sucursalId ? Number(req.query.sucursalId) : undefined;
      const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined;
      const { data, total } = await this.service.findAll({ page, limit, search, sucursalId, activo });
      sendSuccess(res, data, 200, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const m = await this.service.findById(Number(req.params.id));
      sendSuccess(res, m);
    } catch (err) { next(err); }
  };

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.service.getStats(Number(req.params.id), req.query.desde as string | undefined);
      sendSuccess(res, stats);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const m = await this.service.create(req.body);
      sendCreated(res, m);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const m = await this.service.update(Number(req.params.id), req.body);
      sendSuccess(res, m);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) { next(err); }
  };
}
