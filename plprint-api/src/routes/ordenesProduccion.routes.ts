import { Router } from 'express';
import { z } from 'zod';
import { OrdenesProduccionController } from '../controllers/ordenesProduccion.controller';
import { OrdenesProduccionService } from '../services/ordenesProduccion.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new OrdenesProduccionController(new OrdenesProduccionService());

const ESTATUS = ['pendiente', 'en_proceso', 'terminado', 'entregado', 'cancelado'];
const PRIORIDADES = ['baja', 'normal', 'alta', 'urgente'];

const createSchema = z.object({
  sucursalId: z.number().int().positive(),
  productoId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  prioridad: z.enum(PRIORIDADES as [string, ...string[]]).optional(),
  fechaFinEstimada: z.union([z.string(), z.date()]).optional().nullable(),
  usuarioAsignadoId: z.number().int().positive().optional().nullable(),
  maquinaId: z.number().int().positive().optional().nullable(),
  notas: z.string().max(1000).optional().nullable(),
});

const updateSchema = z.object({
  cantidad: z.number().int().positive().optional(),
  prioridad: z.enum(PRIORIDADES as [string, ...string[]]).optional(),
  fechaFinEstimada: z.union([z.string(), z.date()]).optional().nullable(),
  usuarioAsignadoId: z.number().int().positive().optional().nullable(),
  maquinaId: z.number().int().positive().optional().nullable(),
  notas: z.string().max(1000).optional().nullable(),
  cantidadProducida: z.number().int().min(0).optional(),
});

const cambiarEstatusSchema = z.object({
  nuevoEstatus: z.enum(ESTATUS as [string, ...string[]]),
  notas: z.string().max(500).optional().nullable(),
  cantidadProducida: z.number().int().min(0).optional(),
});

router.get('/', authorizePermission('produccion', 'ver'), controller.getAll);
router.get('/estadisticas', authorizePermission('produccion', 'ver'), controller.getEstadisticas);
router.get('/:id', authorizePermission('produccion', 'ver'), controller.getById);
router.post('/', authorizePermission('produccion', 'crear'), validate(createSchema), controller.create);
router.put('/:id', authorizePermission('produccion', 'editar'), validate(updateSchema), controller.update);
router.patch(
  '/:id/estatus',
  authorizePermission('produccion', 'cambiar_estatus'),
  validate(cambiarEstatusSchema),
  controller.cambiarEstatus,
);
router.delete('/:id', authorizePermission('produccion', 'cancelar'), controller.remove);

export default router;
