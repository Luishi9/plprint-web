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

  uploadCsd = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tipo = String(req.body.tipo || '');
      if (tipo !== 'cer' && tipo !== 'key') {
        res.status(400).json({
          success: false,
          message: "tipo debe ser 'cer' o 'key'",
          code: 'VALIDATION_ERROR',
        });
        return;
      }
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se proporciono ningun archivo CSD (.cer/.key)',
          code: 'VALIDATION_ERROR',
        });
        return;
      }

      const fileUrl = `/uploads/csd/${req.file.filename}`;
      const clave = tipo === 'cer' ? 'certificado_cer_path' : 'llave_key_path';
      await this.configuracionService.updateCsdPath(clave, fileUrl);

      sendSuccess(res, { path: fileUrl, tipo });
    } catch (err) {
      next(err);
    }
  };
}
