import { Router } from 'express';
import { z } from 'zod';
import { MermasController } from '../controllers/mermas.controller';
import { MermasService } from '../services/mermas.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';
import { audit } from '../middleware/audit.middleware';

const router = Router();
const controller = new MermasController(new MermasService());

const mermaSchema = z.object({
  tipo: z.enum(['producto', 'insumo']),
  producto_id: z.number().int().positive().optional(),
  insumo_id: z.number().int().positive().optional(),
  sucursal_id: z.number().int().positive().optional(),
  venta_id: z.number().int().positive().optional(),
  maquina_id: z.number().int().positive().optional(),
  cantidad: z.number().positive(),
  motivo: z.string().min(1).max(255),
  costo_estimado: z.number().nonnegative().optional(),
  fecha: z.string().optional(),
});

router.get('/', authorizePermission('mermas', 'ver'), controller.getAll);
router.get('/:id', authorizePermission('mermas', 'ver'), controller.getById);
router.post('/', authorizePermission('mermas', 'crear'), validate(mermaSchema), audit('mermas', 'CREATE'), controller.create);
router.put('/:id', authorizePermission('mermas', 'editar'), validate(mermaSchema.partial()), audit('mermas', 'UPDATE'), controller.update);
router.delete('/:id', authorizePermission('mermas', 'eliminar'), audit('mermas', 'DELETE'), controller.remove);

export default router;
