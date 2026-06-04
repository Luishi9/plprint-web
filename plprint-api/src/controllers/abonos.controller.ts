import { Request, Response, NextFunction } from 'express';
import { AbonosService } from '../services/abonos.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export class AbonosController {
  constructor(private service: AbonosService) {}

  getByVenta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const abonos = await this.service.findByVenta(Number(req.params.ventaId));
      sendSuccess(res, abonos);
    } catch (err) { next(err); }
  };

  registrar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = { ...req.body, usuario_id: req.body.usuario_id || req.user?.sub };
      const result = await this.service.registrar(Number(req.params.ventaId), dto);
      sendCreated(res, result);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.remove(Number(req.params.id));
      sendSuccess(res, result);
    } catch (err) { next(err); }
  };
}
