import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service';
import { sendSuccess } from '../utils/response';

export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Math.min(Number(req.query.limit), 200) : undefined;
      const usuarioId = req.query.usuarioId ? Number(req.query.usuarioId) : undefined;
      const modulo = req.query.modulo ? String(req.query.modulo) : undefined;
      const accion = req.query.accion ? String(req.query.accion) : undefined;
      const desde = req.query.desde ? new Date(String(req.query.desde)) : undefined;
      const hasta = req.query.hasta ? new Date(String(req.query.hasta)) : undefined;

      const result = await this.auditLogService.findAll({
        page,
        limit,
        usuarioId,
        modulo,
        accion,
        desde,
        hasta,
      });

      sendSuccess(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const log = await this.auditLogService.findById(Number(req.params.id));
      sendSuccess(res, log);
    } catch (err) {
      next(err);
    }
  };

  getEstadisticas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.auditLogService.getEstadisticas();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  };
}
