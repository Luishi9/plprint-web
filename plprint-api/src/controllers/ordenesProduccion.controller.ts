import { Request, Response, NextFunction } from 'express';
import { OrdenesProduccionService } from '../services/ordenesProduccion.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class OrdenesProduccionController {
  constructor(private service: OrdenesProduccionService = new OrdenesProduccionService()) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: any = {};
      if (req.query.estatus) filters.estatus = String(req.query.estatus);
      if (req.query.sucursalId) filters.sucursalId = Number(req.query.sucursalId);
      if (req.query.productoId) filters.productoId = Number(req.query.productoId);
      if (req.query.usuarioAsignadoId) filters.usuarioAsignadoId = Number(req.query.usuarioAsignadoId);
      if (req.query.prioridad) filters.prioridad = String(req.query.prioridad);
      if (req.query.search) filters.search = String(req.query.search);
      if (req.query.fechaDesde) filters.fechaDesde = new Date(String(req.query.fechaDesde));
      if (req.query.fechaHasta) filters.fechaHasta = new Date(String(req.query.fechaHasta));

      const ordenes = await this.service.findAll(filters);
      sendSuccess(res, ordenes);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orden = await this.service.findById(Number(req.params.id));
      sendSuccess(res, orden);
    } catch (err) {
      next(err);
    }
  };

  getEstadisticas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = req.query.sucursalId ? Number(req.query.sucursalId) : undefined;
      const stats = await this.service.getEstadisticas(sucursalId);
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orden = await this.service.create({
        ...req.body,
        usuarioCreadorId: req.user?.id ?? req.body.usuarioCreadorId,
      });
      sendCreated(res, orden);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orden = await this.service.update(Number(req.params.id), req.body);
      sendSuccess(res, orden);
    } catch (err) {
      next(err);
    }
  };

  cambiarEstatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orden = await this.service.cambiarEstatus(Number(req.params.id), {
        ...req.body,
        usuarioId: req.user?.id ?? req.body.usuarioId,
      });
      sendSuccess(res, orden);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
