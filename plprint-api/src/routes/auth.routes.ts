import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { audit } from '../middleware/audit.middleware';

const router = Router();
const controller = new AuthController(new AuthService());

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post('/login', authRateLimiter, validate(loginSchema), audit('auth', 'LOGIN'), controller.login);
router.post('/refresh', validate(refreshSchema), audit('auth', 'REFRESH'), controller.refreshToken);
router.get('/me', authenticate, controller.me);
router.post('/logout', authenticate, audit('auth', 'LOGOUT'), controller.logout);

export default router;
