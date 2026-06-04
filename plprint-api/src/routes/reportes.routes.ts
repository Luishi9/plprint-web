import { Router } from 'express';
import { ReportesController } from '../controllers/reportes.controller';
import { ReportesService } from '../services/reportes.service';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new ReportesController(new ReportesService());

router.get('/dashboard', authorizePermission('reportes', 'ver'), controller.dashboard);
router.get('/ventas', authorizePermission('reportes', 'ver'), controller.ventasPorRango);
router.get('/top-productos', authorizePermission('reportes', 'ver'), controller.topProductos);
router.get('/top-clientes', authorizePermission('reportes', 'ver'), controller.topClientes);
router.get('/kardex', authorizePermission('reportes', 'ver'), controller.kardexGlobal);
router.get('/ganancias', authorizePermission('reportes', 'ver'), controller.ganancias);

export default router;
