import { Router } from 'express';
import { z } from 'zod';
import { MaquinasController } from '../controllers/maquinas.controller';
import { MaquinasService } from '../services/maquinas.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new MaquinasController(new MaquinasService());

const maquinaSchema = z.object({
  sucursal_id: z.number().int().positive(),
  nombre: z.string().min(1).max(100),
  tipo: z.string().min(1).max(50),
  marca: z.string().max(50).optional(),
  modelo: z.string().max(50).optional(),
  reset_diario: z.boolean().default(false),
  fecha_instalacion: z.string().optional(),
  contador_inicial: z.number().int().min(0).optional(),
  contador_total: z.number().int().min(0).optional(),
});

router.get('/', authorizePermission('maquinas', 'ver'), controller.getAll);
router.get('/reporte-corte', authorizePermission('maquinas', 'ver_contador'), controller.getReporteCorte);
router.get('/:id', authorizePermission('maquinas', 'ver'), controller.getById);
router.get('/:id/stats', authorizePermission('maquinas', 'ver_contador'), controller.getStats);
router.post('/', authorizePermission('maquinas', 'crear'), validate(maquinaSchema), controller.create);
router.put('/:id', authorizePermission('maquinas', 'editar'), validate(maquinaSchema.partial()), controller.update);
router.delete('/:id', authorizePermission('maquinas', 'eliminar'), controller.remove);

export default router;
