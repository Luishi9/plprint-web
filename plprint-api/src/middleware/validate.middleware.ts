import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

/**
 * Middleware de validacion con Zod.
 * Parsea y reemplaza la parte indicada del request con los datos validados.
 */
export const validate =
  (schema: ZodSchema, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      // Deja que el errorHandler lo procese
      return next(result.error);
    }

    req[part] = result.data;
    next();
  };
