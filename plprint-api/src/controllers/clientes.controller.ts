import { Request, Response, NextFunction } from 'express';
import { ClientesService } from '../services/clientes.service';
import { sendSuccess, sendCreated, sendNoContent, buildPaginationMeta } from '../utils/response';

export class ClientesController {
  constructor(private clientesService: ClientesService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const { data, total } = await this.clientesService.findAll({ page, limit, search });
      sendSuccess(res, data, 200, buildPaginationMeta(total, page, limit));
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cliente = await this.clientesService.findById(Number(req.params.id));
      sendSuccess(res, cliente);
    } catch (err) {
      next(err);
    }
  };

  getHistorial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const historial = await this.clientesService.getHistorial(Number(req.params.id));
      sendSuccess(res, historial);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cliente = await this.clientesService.create(req.body);
      sendCreated(res, cliente);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cliente = await this.clientesService.update(Number(req.params.id), req.body);
      sendSuccess(res, cliente);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.clientesService.softDelete(Number(req.params.id));
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}
