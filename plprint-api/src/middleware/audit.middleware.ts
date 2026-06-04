import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLog.service';
import { JwtPayload } from '../utils/jwt';

const auditLogService = new AuditLogService();

/**
 * Middleware que registra la accion en audit_log despues de una respuesta exitosa.
 * Debe usarse DESPUES de authenticate.
 * Solo se registran respuestas con status < 400.
 */
export const audit = (modulo: string, accion: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalEnd = res.json.bind(res);

    res.json = function (data: unknown) {
      if (res.statusCode < 400) {
        const user = req.user as JwtPayload | undefined;
        const detalle = {
          method: req.method,
          path: req.originalUrl,
          params: req.params,
          body: sanitizarBody(req.body),
        };

        auditLogService
          .record({
            usuarioId: user?.sub ?? null,
            accion,
            modulo,
            detalle,
            ip: req.ip,
          })
          .catch((err) => {
            // No fallar la peticion si la auditoria falla
            // eslint-disable-next-line no-console
            console.error('[audit] Error registrando log:', err);
          });
      }
      return originalEnd(data);
    };

    next();
  };
};

/**
 * Quita campos sensibles del body antes de registrar
 */
function sanitizarBody(body: Record<string, unknown>): Record<string, unknown> {
  if (!body || typeof body !== 'object') return {};
  const sanitized: Record<string, unknown> = { ...body };
  const camposSensibles = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken'];
  for (const campo of camposSensibles) {
    if (campo in sanitized) {
      sanitized[campo] = '***';
    }
  }
  return sanitized;
}
