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
  descuento_motivo: z.string().max(255).optional(),
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
}).refine(
  (data) => data.descuento === 0 || (data.descuento_motivo && data.descuento_motivo.trim().length >= 3),
  {
    message: 'El motivo del descuento es obligatorio (mínimo 3 caracteres) cuando se aplica un descuento',
    path: ['descuento_motivo'],
  },
);

const validarInsumosSchema = z.object({
  sucursalId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().positive(),
      }),
    )
    .min(1),
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createVentaSchema), authorizeSucursal, controller.create);
router.post('/validar-insumos', validate(validarInsumosSchema), controller.validarInsumos);
router.patch('/:id/cancelar', controller.cancel);

export default router;
