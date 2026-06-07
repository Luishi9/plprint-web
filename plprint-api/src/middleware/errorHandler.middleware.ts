import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Error de validacion Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Datos invalidos',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Error de la aplicacion (controlado)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Error de Prisma — clave duplicada
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] | string } };
    if (prismaErr.code === 'P2002') {
      const target = prismaErr.meta?.target;
      const targetStr = Array.isArray(target) ? target.join(', ') : typeof target === 'string' ? target : 'campo único';
      res.status(409).json({
        success: false,
        message: `Ya existe un registro con ese valor (${targetStr})`,
        code: 'CONFLICT',
      });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Registro no encontrado',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  // Error inesperado
  logger.error('Error inesperado', { err, path: req.path, method: req.method });

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(env.NODE_ENV !== 'production' && { detail: String(err) }),
  });
};
