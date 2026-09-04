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
      const sucursalId = req.query.sucursalId ? Number(req.query.sucursalId) : undefined;

      const { data, total } = await this.insumosService.findAll({ page, limit, search, sucursalId });
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

  downloadPlantilla = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.insumosService.generateTemplate();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="plantilla_insumos.xlsx"');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  downloadCatalog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = req.query.sucursalId ? Number(req.query.sucursalId) : undefined;
      const buffer = await this.insumosService.exportCatalog(sucursalId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="catalogo_insumos.xlsx"');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };

  previewImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Debe subir un archivo Excel' });
        return;
      }
      const sucursalId = Number(req.body.sucursalId || req.query.sucursalId);
      if (!sucursalId) {
        res.status(400).json({ error: 'sucursalId es requerido' });
        return;
      }
      const result = await this.insumosService.previewImport(req.file.buffer, sucursalId);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  confirmImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, decisiones, sucursalId } = req.body;
      if (!token) {
        res.status(400).json({ error: 'token es requerido' });
        return;
      }
      if (!sucursalId) {
        res.status(400).json({ error: 'sucursalId es requerido' });
        return;
      }
      const result = await this.insumosService.confirmImport(
        token,
        decisiones ?? {},
        Number(sucursalId),
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };
}
