import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
  },
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta nuevamente mas tarde.',
    code: 'RATE_LIMIT',
  },
});

// Limite mas estricto para autenticacion
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesion. Intenta en 15 minutos.',
    code: 'AUTH_RATE_LIMIT',
  },
});
