import { Router } from 'express';
import { z } from 'zod';
import { NotificacionesController } from '../controllers/notificaciones.controller';
import { NotificacionesService } from '../services/notificaciones.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new NotificacionesController(new NotificacionesService());

const updateConfigSchema = z.object({
  activo: z.boolean().optional(),
  umbral: z.number().nonnegative().nullable().optional(),
});

router.get('/config', controller.getAllConfig);
router.get('/config/:tipo', controller.getConfigByTipo);
router.put(
  '/config/:tipo',
  authorizePermission('notificaciones', 'editar'),
  validate(updateConfigSchema),
  controller.updateConfig,
);

router.get('/resumen', authorizePermission('notificaciones', 'ver'), controller.getResumen);
router.get('/alertas', authorizePermission('notificaciones', 'ver'), controller.getAlertas);
router.get(
  '/stock-bajo-productos',
  authorizePermission('notificaciones', 'ver'),
  controller.getStockBajoProductos,
);
router.get(
  '/stock-bajo-insumos',
  authorizePermission('notificaciones', 'ver'),
  controller.getStockBajoInsumos,
);
router.get('/ventas-dia', authorizePermission('notificaciones', 'ver'), controller.getVentasDelDia);
router.get(
  '/ventas-canceladas',
  authorizePermission('notificaciones', 'ver'),
  controller.getVentasCanceladas,
);
router.get(
  '/productos-sin-stock',
  authorizePermission('notificaciones', 'ver'),
  controller.getProductosSinStock,
);

export default router;
