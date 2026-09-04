import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { ProductosController } from '../controllers/productos.controller';
import { ProductosService } from '../services/productos.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';
import { audit } from '../middleware/audit.middleware';

const router = Router();
const controller = new ProductosController(new ProductosService());

const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imagenes'));
  },
});

const excelUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') cb(null, true);
    else cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'));
  },
});

const createSchema = z.object({
  nombre: z.string().min(1).max(150),
  precioVenta: z.coerce.number().positive(),
  precioCompra: z.coerce.number().positive().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  proveedorId: z.coerce.number().int().positive().optional(),
  maquinaId: z.coerce.number().int().positive().nullable().optional(),
  descripcion: z.string().optional(),
  codigo: z.string().optional(),
  unidadMedida: z.string().optional(),
  cantidadInicial: z.coerce.number().int().min(0).optional(),
  sucursalId: z.coerce.number().int().positive().optional(),
  cobrarMinimo1: z.coerce.boolean().optional(),
  claveProdServ: z.string().max(20).optional(),
  claveUnidad: z.string().max(10).optional(),
  insumos: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch (e) {
          return undefined;
        }
      }
      return val;
    },
    z.array(
      z.object({
        insumoId: z.coerce.number().int().positive(),
        cantidadRequerida: z.coerce.number().positive(),
      })
    ).optional()
  ),
});

router.get('/', controller.getAll);
router.get('/plantilla', authorize(ROLES.ADMIN), controller.downloadPlantilla);
router.get('/exportar', authorize(ROLES.ADMIN), controller.downloadCatalog);
router.get('/:id', controller.getById);
router.get('/:id/insumos', controller.getInsumos);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  upload.single('imagen'),
  validate(createSchema),
  audit('productos', 'CREATE'),
  controller.create,
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  upload.single('imagen'),
  validate(createSchema.partial()),
  audit('productos', 'UPDATE'),
  controller.update,
);
router.delete('/:id', authorize(ROLES.ADMIN), audit('productos', 'DELETE'), controller.remove);

router.post(
  '/importar/preview',
  authorize(ROLES.ADMIN),
  excelUpload.single('file'),
  controller.previewImport,
);
router.post(
  '/importar/confirmar',
  authorize(ROLES.ADMIN),
  audit('productos', 'IMPORT'),
  controller.confirmImport,
);

export default router;
