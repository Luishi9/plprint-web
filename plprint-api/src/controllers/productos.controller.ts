import { Request, Response, NextFunction } from 'express';
import { ProductosService } from '../services/productos.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class ProductosController {
  constructor(private productosService: ProductosService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const categoriaId = req.query.categoriaId ? Number(req.query.categoriaId) : undefined;

      const { data, total } = await this.productosService.findAll({ page, limit, search, categoriaId });
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
}
