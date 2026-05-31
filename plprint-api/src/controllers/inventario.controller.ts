import { Request, Response, NextFunction } from 'express';
import { InventarioService } from '../services/inventario.service';
import { sendSuccess } from '../utils/response';

export class InventarioController {
  constructor(private inventarioService: InventarioService) {}

  getBySucursal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalId = Number(req.params.sucursalId);
      const search = req.query.search as string | undefined;
      const soloStockBajo = req.query.soloStockBajo === 'true';

      const data = await this.inventarioService.findBySucursal(sucursalId, { search, soloStockBajo });
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };

  ajustar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.inventarioService.ajustar({
        ...req.body,
        usuarioId: req.user!.sub,
      });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  getKardex = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productoId = Number(req.params.productoId);
      const sucursalId = Number(req.params.sucursalId);
      const data = await this.inventarioService.getKardex(productoId, sucursalId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  };
}
