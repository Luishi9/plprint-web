import { Request, Response, NextFunction } from 'express';
import { ConfiguracionService } from '../services/configuracion.service';
import { sendSuccess } from '../utils/response';

export class ConfiguracionController {
  constructor(private configuracionService: ConfiguracionService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const configs = await this.configuracionService.findAll();
      sendSuccess(res, configs);
    } catch (err) {
      next(err);
    }
  };

  getByGrupo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const grupo = String(req.params.grupo);
      const configs = await this.configuracionService.findByGrupo(grupo);
      sendSuccess(res, configs);
    } catch (err) {
      next(err);
    }
  };

  updateMany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updates = req.body.updates;
      const result = await this.configuracionService.updateMany(updates);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  };

  uploadLogo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se proporciono ningun archivo de imagen',
          code: 'VALIDATION_ERROR',
        });
        return;
      }

      const logoUrl = `/uploads/${req.file.filename}`;
      await this.configuracionService.updateLogoUrl(logoUrl);

      sendSuccess(res, { logo_url: logoUrl });
    } catch (err) {
      next(err);
    }
  };
}
