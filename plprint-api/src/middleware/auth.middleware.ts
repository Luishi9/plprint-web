import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../config/database';

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token no proporcionado'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    // Verificar que el token_version coincide con el de la BD (protege contra logout)
    const usuario = await prisma.usuarios.findUnique({
      where: { id: payload.sub },
      select: { token_version: true, activo: true },
    });

    if (!usuario || !usuario.activo || usuario.token_version !== payload.tokenVersion) {
      return next(new UnauthorizedError('Sesión inválida. Por favor inicia sesión nuevamente'));
    }

    req.user = payload;
    next();
  } catch {
    next(new UnauthorizedError('Token invalido'));
  }
};
