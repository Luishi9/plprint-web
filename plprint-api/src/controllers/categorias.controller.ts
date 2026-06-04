import { Request, Response, NextFunction } from 'express';
import { CategoriasService } from '../services/categorias.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class CategoriasController {
  constructor(private categoriasService: CategoriasService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tipo = req.query.tipo as string | undefined;
      const categorias = await this.categoriasService.findAll(tipo);
      sendSuccess(res, categorias);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoria = await this.categoriasService.create(req.body);
      sendCreated(res, categoria);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoria = await this.categoriasService.update(Number(req.params.id), req.body);
      sendSuccess(res, categoria);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.categoriasService.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
