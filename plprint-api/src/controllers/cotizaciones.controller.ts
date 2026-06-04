import { Request, Response, NextFunction } from 'express';
import { CotizacionesService } from '../services/cotizaciones.service';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../utils/response';

export class CotizacionesController {
  constructor(private service: CotizacionesService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const estado = req.query.estado as string | undefined;
      const clienteId = req.query.clienteId ? Number(req.query.clienteId) : undefined;
      const { data, total } = await this.service.findAll({ page, limit, search, estado, clienteId });
      sendSuccess(res, data, 200, buildPaginationMeta(total, page, limit));
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const c = await this.service.findById(Number(req.params.id));
      sendSuccess(res, c);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = { ...req.body, usuario_id: req.body.usuario_id || req.user?.sub };
      const c = await this.service.create(dto);
      sendCreated(res, c);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const c = await this.service.update(Number(req.params.id), req.body);
      sendSuccess(res, c);
    } catch (err) { next(err); }
  };

  convertirAVenta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ajustes = { ...req.body, usuario_id: req.body.usuario_id || req.user?.sub };
      const v = await this.service.convertirAVenta(Number(req.params.id), ajustes);
      sendCreated(res, v);
    } catch (err) { next(err); }
  };

  cancelar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const c = await this.service.cancelar(Number(req.params.id));
      sendSuccess(res, c);
    } catch (err) { next(err); }
  };
}
