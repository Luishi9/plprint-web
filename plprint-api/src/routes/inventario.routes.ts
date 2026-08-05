import { Router } from 'express';
import { z } from 'zod';
import { InventarioController } from '../controllers/inventario.controller';
import { InventarioService } from '../services/inventario.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, authorizeSucursal, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new InventarioController(new InventarioService());

const ajusteSchema = z.object({
  productoId: z.number().int().positive(),
  sucursalId: z.number().int().positive(),
  tipo: z.enum(['entrada', 'salida', 'ajuste']),
  cantidad: z.number().int().min(0),
  notas: z.string().optional(),
  stockMinimo: z.number().min(1, 'El stock mínimo debe ser mayor a 0').optional(),
});

router.get('/sucursal/:sucursalId', authorizeSucursal, controller.getBySucursal);
router.get('/kardex/:productoId/:sucursalId', authorizeSucursal, controller.getKardex);
router.post(
  '/ajuste',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  validate(ajusteSchema),
  controller.ajustar,
);

export default router;
