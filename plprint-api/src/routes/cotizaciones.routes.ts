import { Router } from 'express';
import { z } from 'zod';
import { CotizacionesController } from '../controllers/cotizaciones.controller';
import { CotizacionesService } from '../services/cotizaciones.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new CotizacionesController(new CotizacionesService());

const itemSchema = z.object({
  producto_id: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  precio_unitario: z.number().nonnegative(),
  descuento: z.number().nonnegative().default(0),
  ancho_m: z.number().min(0).optional(),
  alto_m: z.number().min(0).optional(),
  unidad_medida_detalle: z.string().max(20).optional(),
});

const cotizacionSchema = z.object({
  cliente_id: z.number().int().positive().optional(),
  sucursal_id: z.number().int().positive().optional(),
  descuento: z.number().nonnegative().default(0),
  descuento_motivo: z.string().max(255).optional(),
  notas: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

const convertirSchema = z.object({
  items: z.array(itemSchema).optional(),
  descuento: z.number().nonnegative().optional(),
  descuento_motivo: z.string().max(255).optional(),
  sucursal_id: z.number().int().positive().optional(),
  metodo_pago: z.string().optional(),
  metodo_pago_id: z.number().int().positive().optional(),
  notas: z.string().optional(),
});

router.get('/', authorizePermission('cotizaciones', 'ver'), controller.getAll);
router.get('/:id', authorizePermission('cotizaciones', 'ver'), controller.getById);
router.post('/', authorizePermission('cotizaciones', 'crear'), validate(cotizacionSchema), controller.create);
router.put('/:id', authorizePermission('cotizaciones', 'editar'), validate(cotizacionSchema.partial()), controller.update);
router.post('/:id/convertir-venta', authorizePermission('cotizaciones', 'convertir_venta'), validate(convertirSchema), controller.convertirAVenta);
router.post('/:id/cancelar', authorizePermission('cotizaciones', 'cancelar'), controller.cancelar);

export default router;
