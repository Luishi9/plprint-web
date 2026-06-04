import { Router } from 'express';
import { z } from 'zod';
import { AuditLogController } from '../controllers/auditLog.controller';
import { AuditLogService } from '../services/auditLog.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new AuditLogController(new AuditLogService());

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  modulo: z.string().optional(),
  accion: z.string().optional(),
  desde: z.string().datetime().optional(),
  hasta: z.string().datetime().optional(),
});

router.get(
  '/',
  authorize(ROLES.ADMIN),
  validate(querySchema, 'query'),
  controller.getAll,
);
router.get(
  '/estadisticas',
  authorize(ROLES.ADMIN),
  controller.getEstadisticas,
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN),
  controller.getById,
);

export default router;
