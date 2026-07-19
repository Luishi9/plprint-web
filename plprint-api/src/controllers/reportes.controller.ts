import { Request, Response, NextFunction } from 'express';
import { ReportesService } from '../services/reportes.service';
import { sendSuccess } from '../utils/response';

export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  private parseRango(req: Request) {
    return {
      desde: req.query.desde ? new Date(String(req.query.desde)) : undefined,
      hasta: req.query.hasta ? new Date(String(req.query.hasta)) : undefined,
      sucursalId: req.query.sucursalId ? Number(req.query.sucursalId) : undefined,
    };
  }

  private requireSucursalId(req: Request, res: Response): number | null {
    const sucursalId = Number(req.query.sucursalId);
    if (!sucursalId) {
      res.status(400).json({ error: 'sucursalId es requerido' });
      return null;
    }
    return sucursalId;
  }

  ventasPorRango = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = this.requireSucursalId(req, res);
      if (sucursalId === null) return;
      const data = await this.reportesService.ventasPorRango({ ...this.parseRango(req), sucursalId });
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  topProductos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = this.requireSucursalId(req, res);
      if (sucursalId === null) return;
      const limite = req.query.limit ? Number(req.query.limit) : 10;
      const data = await this.reportesService.topProductos({ ...this.parseRango(req), sucursalId }, limite);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  topClientes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = this.requireSucursalId(req, res);
      if (sucursalId === null) return;
      const limite = req.query.limit ? Number(req.query.limit) : 10;
      const data = await this.reportesService.topClientes({ ...this.parseRango(req), sucursalId }, limite);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  kardexGlobal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = this.requireSucursalId(req, res);
      if (sucursalId === null) return;
      const data = await this.reportesService.kardexGlobal({
        desde: req.query.desde ? new Date(String(req.query.desde)) : undefined,
        hasta: req.query.hasta ? new Date(String(req.query.hasta)) : undefined,
        productoId: req.query.productoId ? Number(req.query.productoId) : undefined,
        sucursalId,
        limit: req.query.limit ? Number(req.query.limit) : 200,
      });
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  ganancias = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = this.requireSucursalId(req, res);
      if (sucursalId === null) return;
      const data = await this.reportesService.ganancias({ ...this.parseRango(req), sucursalId });
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  dashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = this.requireSucursalId(req, res);
      if (sucursalId === null) return;
      const data = await this.reportesService.dashboard(sucursalId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };
}
