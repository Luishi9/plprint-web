import { Request, Response, NextFunction } from 'express';
import { MetodosPagoService } from '../services/metodosPago.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class MetodosPagoController {
  constructor(private metodosPagoService: MetodosPagoService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const metodos = await this.metodosPagoService.findAll(includeInactive);
      sendSuccess(res, metodos);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metodo = await this.metodosPagoService.findById(Number(req.params.id));
      sendSuccess(res, metodo);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metodo = await this.metodosPagoService.create(req.body);
      sendCreated(res, metodo);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metodo = await this.metodosPagoService.update(Number(req.params.id), req.body);
      sendSuccess(res, metodo);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.metodosPagoService.remove(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  toggleActivo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metodo = await this.metodosPagoService.toggleActivo(Number(req.params.id));
      sendSuccess(res, metodo);
    } catch (err) {
      next(err);
    }
  };
}
