import { Router } from 'express';
import { z } from 'zod';
import { UsuariosController } from '../controllers/usuarios.controller';
import { UsuariosService } from '../services/usuarios.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new UsuariosController(new UsuariosService());

const createSchema = z.object({
  nombre: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  rolId: z.number().int().min(1).max(3),
});

const asignarSchema = z.object({
  sucursalId: z.number().int().positive(),
});

// Solo admin puede gestionar usuarios
router.get('/', authorize(ROLES.ADMIN), controller.getAll);
router.get('/:id', authorize(ROLES.ADMIN), controller.getById);
router.post('/', authorize(ROLES.ADMIN), validate(createSchema), controller.create);
router.put('/:id', authorize(ROLES.ADMIN), validate(createSchema.partial()), controller.update);
router.delete('/:id', authorize(ROLES.ADMIN), controller.remove);
router.post('/:id/sucursales', authorize(ROLES.ADMIN), validate(asignarSchema), controller.asignarSucursal);
router.delete('/:id/sucursales/:sucursalId', authorize(ROLES.ADMIN), controller.removerSucursal);

export default router;
