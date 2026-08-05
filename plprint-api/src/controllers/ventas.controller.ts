import { Request, Response, NextFunction } from 'express';
import { VentasService } from '../services/ventas.service';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../utils/response';

export class VentasController {
  constructor(private ventasService: VentasService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const sucursalId = Number(req.query.sucursalId);
      if (!sucursalId) {
        res.status(400).json({ error: 'sucursalId es requerido' });
        return;
      }
      const desde = req.query.desde as string | undefined;
      const hasta = req.query.hasta as string | undefined;
      const estado = (req.query.estado as 'completada' | 'cancelada' | undefined) || undefined;
      const estadoPago = (req.query.estadoPago as 'pendiente' | 'parcial' | undefined) || undefined;
      const search = req.query.search as string | undefined;
      const usuarioIdFiltro = req.query.usuarioId ? Number(req.query.usuarioId) : undefined;

      const { data, total } = await this.ventasService.findAll({
        page, limit, sucursalId, desde, hasta, estado, estadoPago, search,
        usuarioId: req.user!.rolId !== 1 ? req.user!.sub : undefined,
        usuarioIdFiltro: req.user!.rolId === 1 ? usuarioIdFiltro : undefined,
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

  /**
   * Public ticket endpoint - no auth, rate-limited at route level.
   * Returns the bare minimum needed to render a customer-facing ticket.
   */
  getPublicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ success: false, message: 'ID inválido' });
        return;
      }
      const venta = await this.ventasService.findByIdPublic(id);
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
      const venta = await this.ventasService.cancel(Number(req.params.id), req.user!.sub, req.body);
      sendSuccess(res, venta);
    } catch (err) {
      next(err);
    }
  };

  getProductosConInsumos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productos = await this.ventasService.getProductosConInsumosByVenta(Number(req.params.id));
      sendSuccess(res, productos);
    } catch (err) {
      next(err);
    }
  };

  validarInsumos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sucursalId, items } = req.body;
      const resultado = await this.ventasService.validarInsumos(sucursalId, items);
      sendSuccess(res, resultado);
    } catch (err) {
      next(err);
    }
  };
}
