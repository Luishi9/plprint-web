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
import proveedoresRoutes from './proveedores.routes';
import unidadesMedidaRoutes from './unidadesMedida.routes';
import gastosRoutes from './gastos.routes';
import comprasRoutes from './compras.routes';
import cotizacionesRoutes from './cotizaciones.routes';
import mermasRoutes from './mermas.routes';
import abonosRoutes from './abonos.routes';
import maquinasRoutes from './maquinas.routes';
import ordenesProduccionRoutes from './ordenesProduccion.routes';
import preciosProductoRoutes from './preciosProducto.routes';
import cajaRoutes from './caja.routes';
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
router.use('/proveedores', proveedoresRoutes);
router.use('/unidades-medida', unidadesMedidaRoutes);
router.use('/gastos', gastosRoutes);
router.use('/compras', comprasRoutes);
router.use('/cotizaciones', cotizacionesRoutes);
router.use('/mermas', mermasRoutes);
router.use('/abonos', abonosRoutes);
router.use('/maquinas', maquinasRoutes);
router.use('/ordenes-produccion', ordenesProduccionRoutes);
router.use('/productos', preciosProductoRoutes);
router.use('/caja', cajaRoutes);

export default router;
