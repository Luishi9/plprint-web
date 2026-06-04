import { Router } from 'express';
import { z } from 'zod';
import { ProveedoresController } from '../controllers/proveedores.controller';
import { ProveedoresService } from '../services/proveedores.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new ProveedoresController(new ProveedoresService());

const proveedorSchema = z.object({
  nombre: z.string().min(1).max(150),
  contacto: z.string().max(100).optional(),
  telefono: z.string().max(20).optional(),
  email: z.string().email().max(150).optional().or(z.literal('')),
  rfc: z.string().max(20).optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authorizePermission('proveedores', 'crear'), validate(proveedorSchema), controller.create);
router.put('/:id', authorizePermission('proveedores', 'editar'), validate(proveedorSchema.partial()), controller.update);
router.delete('/:id', authorizePermission('proveedores', 'eliminar'), controller.remove);

export default router;
