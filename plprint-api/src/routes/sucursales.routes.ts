import { Router } from 'express';
import { z } from 'zod';
import { SucursalesController } from '../controllers/sucursales.controller';
import { SucursalesService } from '../services/sucursales.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new SucursalesController(new SucursalesService());

const sucursalSchema = z.object({
  nombre: z.string().min(1).max(100),
  direccion: z.string().optional(),
  telefono: z.string().max(20).optional(),
  activa: z.boolean().optional(),
  copiarProductos: z.boolean().optional(),
  copiarInsumos: z.boolean().optional(),
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorize(ROLES.ADMIN), validate(sucursalSchema), controller.create);
router.put('/:id', authorize(ROLES.ADMIN), validate(sucursalSchema.partial()), controller.update);
router.delete('/:id', authorize(ROLES.ADMIN), controller.remove);

export default router;
