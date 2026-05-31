import { Router } from 'express';
import { z } from 'zod';
import { VentasController } from '../controllers/ventas.controller';
import { VentasService } from '../services/ventas.service';
import { validate } from '../middleware/validate.middleware';
import { authorizeSucursal } from '../middleware/rbac.middleware';

const router = Router();
const controller = new VentasController(new VentasService());

const createVentaSchema = z.object({
  sucursalId: z.number().int().positive(),
  clienteId: z.number().int().positive().optional(),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'otro']).default('efectivo'),
  descuento: z.number().min(0).default(0),
  notas: z.string().optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().positive(),
        precioUnitario: z.number().positive(),
        descuento: z.number().min(0).default(0),
      }),
    )
    .min(1),
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createVentaSchema), authorizeSucursal, controller.create);
router.patch('/:id/cancelar', controller.cancel);

export default router;
