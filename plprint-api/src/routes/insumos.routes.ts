import { Router } from 'express';
import { z } from 'zod';
import { InsumosController } from '../controllers/insumos.controller';
import { InsumosService } from '../services/insumos.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new InsumosController(new InsumosService());

const createSchema = z.object({
  nombre: z.string().min(1).max(150),
  codigo: z.string().optional(),
  descripcion: z.string().optional(),
  unidadMedida: z.string().optional(),
  precioCompra: z.coerce.number().positive().optional(),
  proveedorId: z.coerce.number().int().positive().optional(),
});

const ajusteSchema = z.object({
  insumoId: z.coerce.number().int().positive(),
  sucursalId: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().positive(),
  tipo: z.enum(['entrada', 'salida']),
});

router.get('/', controller.getAll);
router.get('/sucursal/:sucursalId', controller.getInventarioBySucursal);
router.get('/:id', controller.getById);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  validate(createSchema),
  controller.create,
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  validate(createSchema.partial()),
  controller.update,
);
router.delete('/:id', authorize(ROLES.ADMIN), controller.remove);
router.post(
  '/ajuste',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  validate(ajusteSchema),
  controller.ajustarStock,
);

export default router;
