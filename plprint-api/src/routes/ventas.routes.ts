import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { VentasController } from '../controllers/ventas.controller';
import { VentasService } from '../services/ventas.service';
import { validate } from '../middleware/validate.middleware';
import { authorizeSucursal } from '../middleware/rbac.middleware';
import { audit } from '../middleware/audit.middleware';

const router = Router();
const controller = new VentasController(new VentasService());

// Limite estricto para el endpoint publico del ticket (anti-enumeracion).
// 30 requests por 5 minutos por IP.
const publicTicketRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Demasiadas peticiones. Intenta mas tarde.', code: 'RATE_LIMIT' },
});

const createVentaSchema = z.object({
  sucursalId: z.number().int().positive(),
  clienteId: z.number().int().positive().optional(),
  metodoPago: z.enum(['efectivo', 'tarjeta', 'transferencia', 'otro']).default('efectivo'),
  descuento: z.number().min(0).default(0),
  descuento_motivo: z.string().max(255).optional(),
  notas: z.string().optional(),
  estadoPago: z.enum(['pagada', 'pendiente', 'parcial']).default('pagada'),
  saldoInicial: z.number().min(0).optional(),
  items: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().positive(),
        precioUnitario: z.number().positive(),
        descuento: z.number().min(0).default(0),
        ancho_m: z.number().min(0).optional(),
        alto_m: z.number().min(0).optional(),
        unidad_medida_detalle: z.string().max(20).optional(),
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

const cancelVentaSchema = z
  .object({
    insumosDecision: z
      .array(
        z.object({
          productoId: z.number().int().positive(),
          accion: z.enum(['revertir', 'merma']),
        }),
      )
      .optional(),
  })
  .optional();

router.get('/', controller.getAll);
router.get('/public/:id', publicTicketRateLimiter, controller.getPublicById);
router.get('/:id', controller.getById);
router.get('/:id/productos-con-insumos', controller.getProductosConInsumos);
router.post('/', validate(createVentaSchema), authorizeSucursal, audit('ventas', 'CREATE'), controller.create);
router.post('/validar-insumos', validate(validarInsumosSchema), controller.validarInsumos);
router.patch('/:id/cancelar', validate(cancelVentaSchema), audit('ventas', 'CANCELAR'), controller.cancel);

export default router;
