import { Router } from 'express';
import { z } from 'zod';
import { GastosController } from '../controllers/gastos.controller';
import { GastosService } from '../services/gastos.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new GastosController(new GastosService());

const categoriaSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().max(255).optional(),
});

const gastoSchema = z.object({
  categoria_id: z.number().int().positive(),
  concepto: z.string().min(1).max(200),
  monto: z.number().positive(),
  tipo: z.enum(['gasto', 'ingreso', 'retiro']).default('gasto'),
  sucursal_id: z.number().int().positive().optional(),
  autorizado_por: z.number().int().positive().optional(),
  comprobante_url: z.string().max(500).optional(),
  notas: z.string().optional(),
  fecha: z.string().optional(),
});

// === Categorías ===
router.get('/categorias', authorizePermission('gastos', 'categoria_ver'), controller.getAllCategorias);
router.post('/categorias', authorizePermission('gastos', 'categoria_gestionar'), validate(categoriaSchema), controller.createCategoria);
router.put('/categorias/:id', authorizePermission('gastos', 'categoria_gestionar'), validate(categoriaSchema.partial()), controller.updateCategoria);
router.delete('/categorias/:id', authorizePermission('gastos', 'categoria_gestionar'), controller.removeCategoria);

// === Gastos ===
router.get('/', authorizePermission('gastos', 'ver'), controller.getAllGastos);
router.get('/:id', authorizePermission('gastos', 'ver'), controller.getGastoById);
router.post('/', authorizePermission('gastos', 'crear'), validate(gastoSchema), controller.createGasto);
router.put('/:id', authorizePermission('gastos', 'editar'), validate(gastoSchema.partial()), controller.updateGasto);
router.delete('/:id', authorizePermission('gastos', 'eliminar'), controller.removeGasto);

export default router;
