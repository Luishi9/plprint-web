import { Router } from 'express';
import { z } from 'zod';
import { UnidadesMedidaController } from '../controllers/unidadesMedida.controller';
import { UnidadesMedidaService } from '../services/unidadesMedida.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new UnidadesMedidaController(new UnidadesMedidaService());

const unidadSchema = z.object({
  nombre: z.string().min(1).max(50),
  abreviatura: z.string().min(1).max(10),
  es_medida: z.boolean().optional(),
  tipo_medida: z.enum(['m2', 'ml']).nullable().optional(),
});

router.get('/', controller.getAll);
router.post('/', authorizePermission('unidades_medida', 'gestionar'), validate(unidadSchema), controller.create);
router.put('/:id', authorizePermission('unidades_medida', 'gestionar'), validate(unidadSchema.partial()), controller.update);
router.delete('/:id', authorizePermission('unidades_medida', 'gestionar'), controller.remove);

export default router;
