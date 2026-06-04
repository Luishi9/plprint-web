import { Router } from 'express';
import { z } from 'zod';
import { MetodosPagoController } from '../controllers/metodosPago.controller';
import { MetodosPagoService } from '../services/metodosPago.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new MetodosPagoController(new MetodosPagoService());

const createSchema = z.object({
  nombre: z.string().min(1).max(50),
  icono: z.string().max(30).optional(),
});

const updateSchema = z.object({
  nombre: z.string().min(1).max(50).optional(),
  icono: z.string().max(30).optional(),
  activo: z.boolean().optional(),
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createSchema),
  controller.create,
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(updateSchema),
  controller.update,
);
router.delete('/:id', authorize(ROLES.ADMIN), controller.remove);
router.patch('/:id/toggle', authorize(ROLES.ADMIN), controller.toggleActivo);

export default router;
