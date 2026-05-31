import { Router } from 'express';
import authRoutes from './auth.routes';
import productosRoutes from './productos.routes';
import ventasRoutes from './ventas.routes';
import inventarioRoutes from './inventario.routes';
import clientesRoutes from './clientes.routes';
import usuariosRoutes from './usuarios.routes';
import sucursalesRoutes from './sucursales.routes';
import categoriasRoutes from './categorias.routes';
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

export default router;
