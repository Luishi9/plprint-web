import { Router } from 'express';
import authRoutes from './auth.routes';
import productosRoutes from './productos.routes';
import ventasRoutes from './ventas.routes';
import inventarioRoutes from './inventario.routes';
import clientesRoutes from './clientes.routes';
import usuariosRoutes from './usuarios.routes';
import sucursalesRoutes from './sucursales.routes';
import categoriasRoutes from './categorias.routes';
import insumosRoutes from './insumos.routes';
import configuracionRoutes from './configuracion.routes';
import rolesRoutes from './roles.routes';
import metodosPagoRoutes from './metodosPago.routes';
import auditLogRoutes from './auditLog.routes';
import respaldoRoutes from './respaldo.routes';
import notificacionesRoutes from './notificaciones.routes';
import reportesRoutes from './reportes.routes';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Ruta publica
router.use('/auth', authRoutes);

// Rutas protegidas
router.use(authenticate);
router.use('/productos', productosRoutes);
router.use('/ventas', ventasRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/clientes', clientesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/sucursales', sucursalesRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/insumos', insumosRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/roles', rolesRoutes);
router.use('/metodos-pago', metodosPagoRoutes);
router.use('/audit-log', auditLogRoutes);
router.use('/respaldo', respaldoRoutes);
router.use('/notificaciones', notificacionesRoutes);
router.use('/reportes', reportesRoutes);

export default router;
