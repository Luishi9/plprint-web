import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { InsumosController } from '../controllers/insumos.controller';
import { InsumosService } from '../services/insumos.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';
import { audit } from '../middleware/audit.middleware';

const router = Router();
const controller = new InsumosController(new InsumosService());

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') cb(null, true);
    else cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
  },
});

const createSchema = z.object({
  nombre: z.string().min(1).max(150),
  codigo: z.string().optional(),
  descripcion: z.string().optional(),
  unidadMedida: z.string().optional(),
  anchoRollo: z.coerce.number().positive().optional(),
  precioCompra: z.coerce.number().positive().optional(),
  proveedorId: z.coerce.number().int().positive().optional(),
  sucursalId: z.coerce.number().int().positive(),
});

const ajusteSchema = z.object({
  insumoId: z.coerce.number().int().positive(),
  sucursalId: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().positive(),
  tipo: z.enum(['entrada', 'salida']),
});

router.get('/', controller.getAll);
router.get('/plantilla', authorize(ROLES.ADMIN), controller.downloadPlantilla);
router.get('/exportar', authorize(ROLES.ADMIN), controller.downloadCatalog);
router.get('/sucursal/:sucursalId', controller.getInventarioBySucursal);
router.get('/:id', controller.getById);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  validate(createSchema),
  audit('insumos', 'CREATE'),
  controller.create,
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  validate(createSchema.partial()),
  audit('insumos', 'UPDATE'),
  controller.update,
);
router.delete('/:id', authorize(ROLES.ADMIN), audit('insumos', 'DELETE'), controller.remove);
router.post(
  '/ajuste',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  validate(ajusteSchema),
  audit('insumos', 'AJUSTAR_STOCK'),
  controller.ajustarStock,
);

router.post(
  '/importar/preview',
  authorize(ROLES.ADMIN),
  excelUpload.single('file'),
  controller.previewImport,
);
router.post(
  '/importar/confirmar',
  authorize(ROLES.ADMIN),
  audit('insumos', 'IMPORT'),
  controller.confirmImport,
);

export default router;
