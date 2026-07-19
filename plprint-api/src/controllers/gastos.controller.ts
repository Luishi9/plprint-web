import { Request, Response, NextFunction } from 'express';
import { GastosService } from '../services/gastos.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class GastosController {
  constructor(private gastosService: GastosService) {}

  // === Categorías ===
  getAllCategorias = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cats = await this.gastosService.findAllCategorias();
      sendSuccess(res, cats);
    } catch (err) { next(err); }
  };

  createCategoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cat = await this.gastosService.createCategoria(req.body);
      sendCreated(res, cat);
    } catch (err) { next(err); }
  };

  updateCategoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cat = await this.gastosService.updateCategoria(Number(req.params.id), req.body);
      sendSuccess(res, cat);
    } catch (err) { next(err); }
  };

  removeCategoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.gastosService.removeCategoria(Number(req.params.id));
      sendNoContent(res);
    } catch (err) { next(err); }
  };

  // === Gastos ===
  getAllGastos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const fechaDesde = req.query.fechaDesde as string | undefined;
      const fechaHasta = req.query.fechaHasta as string | undefined;
      const tipo = req.query.tipo as string | undefined;
      const categoriaId = req.query.categoriaId ? Number(req.query.categoriaId) : undefined;
      const sucursalId = Number(req.query.sucursalId);
      if (!sucursalId) {
        res.status(400).json({ error: 'sucursalId es requerido' });
        return;
      }
      const { data, total, totalMonto } = await this.gastosService.findAllGastos({
        page, limit, search, fechaDesde, fechaHasta, tipo, categoriaId, sucursalId,
      });
      sendSuccess(res, data, 200, { ...buildPaginationMeta(total, page, limit), totalMonto: Number(totalMonto) });
    } catch (err) { next(err); }
  };

  getGastoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const g = await this.gastosService.findGastoById(Number(req.params.id));
      sendSuccess(res, g);
    } catch (err) { next(err); }
  };

  createGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = { ...req.body, usuario_id: req.body.usuario_id || req.user?.sub };
      const g = await this.gastosService.createGasto(dto);
      sendCreated(res, g);
    } catch (err) { next(err); }
  };

  updateGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const g = await this.gastosService.updateGasto(Number(req.params.id), req.body);
      sendSuccess(res, g);
    } catch (err) { next(err); }
  };

  removeGasto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.gastosService.removeGasto(Number(req.params.id));
      sendNoContent(res);
    } catch (err) { next(err); }
  };
}
