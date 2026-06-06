import { Router } from 'express';
import * as ctrl from '../controllers/preciosProducto.controller';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createSchema = z.object({
  nivel: z.enum(['medio_mayoreo', 'mayoreo', 'super_mayoreo']),
  cantidad_minima: z.number().int().min(1),
  precio: z.number().min(0),
});

const updateSchema = z.object({
  cantidad_minima: z.number().int().min(1).optional(),
  precio: z.number().min(0).optional(),
  activo: z.boolean().optional(),
});

router.get('/:id/precios', authorizePermission('productos', 'ver'), ctrl.getByProducto);
router.post('/:id/precios', authorizePermission('productos', 'editar'), validate(createSchema, 'body'), ctrl.create);
router.put('/:id/precios/:precioId', authorizePermission('productos', 'editar'), validate(updateSchema, 'body'), ctrl.update);
router.delete('/:id/precios/:precioId', authorizePermission('productos', 'editar'), ctrl.remove);

export default router;
