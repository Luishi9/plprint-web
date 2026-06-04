import { Router } from 'express';
import { z } from 'zod';
import { RolesController } from '../controllers/roles.controller';
import { RolesService } from '../services/roles.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new RolesController(new RolesService());

const createSchema = z.object({
  nombre: z.string().min(1).max(50),
  descripcion: z.string().max(200).optional(),
  permisos: z.array(z.coerce.number().int().positive()).default([]),
});

const updateSchema = z.object({
  nombre: z.string().min(1).max(50).optional(),
  descripcion: z.string().max(200).optional(),
  activo: z.boolean().optional(),
  permisos: z.array(z.coerce.number().int().positive()).optional(),
});

router.get('/', authorize(ROLES.ADMIN), controller.getAll);
router.get('/permisos', authorize(ROLES.ADMIN), controller.getAllPermisos);
router.get('/:id', authorize(ROLES.ADMIN), controller.getById);
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

export default router;
