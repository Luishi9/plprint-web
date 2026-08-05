import { Router } from 'express';
import { z } from 'zod';
import { ComprasController } from '../controllers/compras.controller';
import { ComprasService } from '../services/compras.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';
import { audit } from '../middleware/audit.middleware';

const router = Router();
const controller = new ComprasController(new ComprasService());

const compraSchema = z.object({
  insumo_id: z.number().int().positive(),
  cantidad: z.number().positive(),
  precio_unitario: z.number().positive(),
  proveedor_id: z.number().int().positive().optional(),
  sucursal_id: z.number().int().positive().optional(),
  notas: z.string().optional(),
  fecha: z.string().optional(),
});

const compraBatchSchema = z.object({
  items: z.array(z.object({
    insumo_id: z.number().int().positive(),
    cantidad: z.number().positive(),
    precio_unitario: z.number().positive(),
    proveedor_id: z.number().int().positive().optional(),
    notas: z.string().optional(),
  })).min(1, 'Debe agregar al menos un insumo'),
  sucursal_id: z.number().int().positive(),
  factura: z.string().optional(),
  fecha: z.string().optional(),
});

router.get('/', authorizePermission('compras', 'ver'), controller.getAll);
router.get('/:id', authorizePermission('compras', 'ver'), controller.getById);
router.post('/', authorizePermission('compras', 'crear'), validate(compraSchema), audit('compras', 'CREATE'), controller.create);
router.post('/batch', authorizePermission('compras', 'crear'), validate(compraBatchSchema), audit('compras', 'IMPORT'), controller.createBatch);
router.delete('/:id', authorizePermission('compras', 'anular'), audit('compras', 'DELETE'), controller.remove);

export default router;
