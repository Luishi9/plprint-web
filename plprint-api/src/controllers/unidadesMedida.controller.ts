import { Request, Response, NextFunction } from 'express';
import { UnidadesMedidaService } from '../services/unidadesMedida.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class UnidadesMedidaController {
  constructor(private unidadesMedidaService: UnidadesMedidaService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unidades = await this.unidadesMedidaService.findAll();
      sendSuccess(res, unidades);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unidad = await this.unidadesMedidaService.create(req.body);
      sendCreated(res, unidad);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unidad = await this.unidadesMedidaService.update(Number(req.params.id), req.body);
      sendSuccess(res, unidad);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.unidadesMedidaService.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
