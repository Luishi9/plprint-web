import { Request, Response, NextFunction } from 'express';
import { RespaldoService } from '../services/respaldo.service';
import { sendSuccess } from '../utils/response';

export class RespaldoController {
  constructor(private respaldoService: RespaldoService) {}

  generate = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backup = await this.respaldoService.generateBackup();
      sendSuccess(res, {
        filename: backup.filename,
        size: backup.size,
        size_mb: (backup.size / 1024 / 1024).toFixed(2),
        created_at: backup.createdAt,
        download_url: `/api/v1/respaldo/download/${backup.filename}`,
      });
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const backups = await this.respaldoService.listBackups();
      sendSuccess(
        res,
        backups.map((b) => ({
          filename: b.filename,
          size: b.size,
          size_mb: (b.size / 1024 / 1024).toFixed(2),
          created_at: b.createdAt,
          download_url: `/api/v1/respaldo/download/${b.filename}`,
        })),
      );
    } catch (err) {
      next(err);
    }
  };

  download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filename = String(req.params.filename);
      const { path: filePath } = await this.respaldoService.getBackupPath(filename);

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const fs = await import('fs');
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filename = String(req.params.filename);
      await this.respaldoService.deleteBackup(filename);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  stats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.respaldoService.getDatabaseStats();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  };
}
