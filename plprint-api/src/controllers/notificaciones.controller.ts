import { Request, Response, NextFunction } from 'express';
import { NotificacionesService } from '../services/notificaciones.service';
import { sendSuccess } from '../utils/response';

export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  // ============== CONFIGURACIÓN ==============

  getAllConfig = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.notificacionesService.findAllConfig();
      sendSuccess(res, config);
    } catch (err) {
      next(err);
    }
  };

  getConfigByTipo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.notificacionesService.findConfigByTipo(String(req.params.tipo));
      sendSuccess(res, config);
    } catch (err) {
      next(err);
    }
  };

  updateConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.notificacionesService.updateConfig(
        String(req.params.tipo),
        req.body,
      );
      sendSuccess(res, config);
    } catch (err) {
      next(err);
    }
  };

  // ============== ALERTAS ==============

  getResumen = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resumen = await this.notificacionesService.getResumen();
      sendSuccess(res, resumen);
    } catch (err) {
      next(err);
    }
  };

  getAlertas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alertas = await this.notificacionesService.getAlertas();
      sendSuccess(res, alertas);
    } catch (err) {
      next(err);
    }
  };

  getStockBajoProductos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productos = await this.notificacionesService.getStockBajoProductos();
      sendSuccess(res, productos);
    } catch (err) {
      next(err);
    }
  };

  getStockBajoInsumos = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const insumos = await this.notificacionesService.getStockBajoInsumos();
      sendSuccess(res, insumos);
    } catch (err) {
      next(err);
    }
  };

  getVentasDelDia = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.notificacionesService.getVentasDelDia();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  getVentasCanceladas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ventas = await this.notificacionesService.getVentasCanceladas();
      sendSuccess(res, ventas);
    } catch (err) {
      next(err);
    }
  };

  getProductosSinStock = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productos = await this.notificacionesService.getProductosSinStock();
      sendSuccess(res, productos);
    } catch (err) {
      next(err);
    }
  };
}
