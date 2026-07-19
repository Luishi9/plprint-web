import { Request, Response, NextFunction } from 'express';
import { MermasService } from '../services/mermas.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class MermasController {
  constructor(private service: MermasService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const tipo = req.query.tipo as string | undefined;
      const fechaDesde = req.query.fechaDesde as string | undefined;
      const fechaHasta = req.query.fechaHasta as string | undefined;
      const sucursalId = Number(req.query.sucursalId);
      if (!sucursalId) {
        res.status(400).json({ error: 'sucursalId es requerido' });
        return;
      }
      const { data, total, totalCantidad, totalCosto } = await this.service.findAll({
        page, limit, search, tipo, fechaDesde, fechaHasta, sucursalId,
      });
      sendSuccess(res, data, 200, {
        ...buildPaginationMeta(total, page, limit),
        totalCantidad: Number(totalCantidad),
        totalCosto: Number(totalCosto),
      });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const m = await this.service.findById(Number(req.params.id));
      sendSuccess(res, m);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = { ...req.body, usuario_id: req.body.usuario_id || req.user?.sub };
      const m = await this.service.create(dto);
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
