import { Router } from 'express';
import { z } from 'zod';
import { CajaController } from '../controllers/caja.controller';
import { CajaService } from '../services/caja.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';
import { audit } from '../middleware/audit.middleware';

const router = Router();
const controller = new CajaController(new CajaService());

const aperturaSchema = z.object({
  sucursal_id: z.number().int().positive(),
  monto_inicial: z.number().min(0),
});

const corteSchema = z.object({
  corte_id: z.number().int().positive(),
  monto_final_real: z.number().min(0),
  observaciones: z.string().max(500).optional(),
  maquinasContadores: z.array(z.object({
    maquinaId: z.number().int().positive(),
    contadorFinal: z.number().min(0),
  })).optional(),
});

const movimientoCajaSchema = z.object({
  sucursal_id: z.number().int().positive(),
  categoria_id: z.number().int().positive(),
  concepto: z.string().min(1).max(200),
  monto: z.number().positive(),
  autorizado_por: z.number().int().positive().optional(),
  notas: z.string().max(500).optional(),
});

router.get('/estado', authorizePermission('caja', 'ver'), controller.getEstado);
router.get('/movimientos', authorizePermission('caja', 'ver'), controller.getMovimientos);
router.get('/cortes', authorizePermission('caja', 'ver'), controller.getCortes);
router.get('/cortes/:id', authorizePermission('caja', 'ver'), controller.getCorteById);
router.get('/cortes/:id/reimprimir', authorizePermission('caja', 'reimprimir'), controller.getCorteReimprimir);
router.get('/cortes/:id/reporte-maquinas', authorizePermission('caja', 'cerrar'), controller.getCorteReporteMaquinas);
router.get('/cortes/:id/reporte-categorias-impresion', authorizePermission('caja', 'cerrar'), controller.getCorteReporteCategoriasImpresion);

router.post('/apertura', authorizePermission('caja', 'aperturar'), validate(aperturaSchema), audit('caja', 'APERTURAR'), controller.aperturar);
router.post('/corte', authorizePermission('caja', 'cerrar'), validate(corteSchema), audit('caja', 'CORTAR'), controller.realizarCorte);
router.post('/ingreso', authorizePermission('caja', 'ingreso'), validate(movimientoCajaSchema), audit('caja', 'INGRESO'), controller.registrarIngreso);
router.post('/gasto', authorizePermission('caja', 'gasto'), validate(movimientoCajaSchema), audit('caja', 'GASTO'), controller.registrarGasto);
router.post('/retiro', authorizePermission('caja', 'retiro'), validate(movimientoCajaSchema), audit('caja', 'RETIRO'), controller.registrarRetiro);

export default router;
