import { Request, Response, NextFunction } from 'express';
import { ProductosService } from '../services/productos.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';
import fs from 'fs';

export class ProductosController {
  constructor(private productosService: ProductosService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const categoriaId = req.query.categoriaId ? Number(req.query.categoriaId) : undefined;
      const categoriaTipo = req.query.categoriaTipo as string | undefined;
      const sucursalId = Number(req.query.sucursalId);
      if (!sucursalId) {
        res.status(400).json({ error: 'sucursalId es requerido' });
        return;
      }
      const { data, total } = await this.productosService.findAll({ page, limit, search, categoriaId, categoriaTipo, sucursalId });
      const meta = buildPaginationMeta(total, page, limit);
      sendSuccess(res, data, 200, meta);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const producto = await this.productosService.findById(Number(req.params.id));
      sendSuccess(res, producto);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imagenUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      
      // Parsear insumos si viene como string JSON
      let insumos = req.body.insumos;
      if (typeof insumos === 'string') {
        try {
          insumos = JSON.parse(insumos);
        } catch (e) {
          insumos = undefined;
        }
      }
      
      const producto = await this.productosService.create({
        ...req.body,
        insumos,
        imagenUrl,
        usuarioId: req.user?.sub,
        sucursalId: req.body.sucursalId ? Number(req.body.sucursalId) : undefined,
      });
      sendCreated(res, producto);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imagenUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      
      // Parsear insumos si viene como string JSON
      let insumos = req.body.insumos;
      if (typeof insumos === 'string') {
        try {
          insumos = JSON.parse(insumos);
        } catch (e) {
          insumos = undefined;
        }
      }
      
      const producto = await this.productosService.update(Number(req.params.id), {
        ...req.body,
        insumos,
        ...(imagenUrl && { imagenUrl }),
      });
      sendSuccess(res, producto);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productosService.softDelete(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  getInsumos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const insumos = await this.productosService.getInsumosByProducto(Number(req.params.id));
      sendSuccess(res, insumos);
    } catch (err) {
      next(err);
    }
  };

  downloadPlantilla = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.productosService.generateTemplate();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="plantilla_productos.xlsx"');
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
      const sucursalId = Number(req.body.sucursalId);
      if (!sucursalId) {
        res.status(400).json({ error: 'sucursalId es requerido' });
        return;
      }
      const result = await this.productosService.previewImport(req.file.path, sucursalId);
      fs.unlink(req.file.path, () => {});
      sendSuccess(res, result);
    } catch (err) {
      if (req.file) fs.unlink(req.file.path, () => {});
      next(err);
    }
  };

  confirmImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, decisiones, sucursalId } = req.body;
      if (!token || !sucursalId) {
        res.status(400).json({ error: 'token y sucursalId son requeridos' });
        return;
      }
      const result = await this.productosService.confirmImport(
        token,
        decisiones ?? {},
        Number(sucursalId),
        req.user!.sub,
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  downloadCatalog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = req.query.sucursalId ? Number(req.query.sucursalId) : undefined;
      const buffer = await this.productosService.exportCatalog(sucursalId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="catalogo_productos.xlsx"');
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  };
}
