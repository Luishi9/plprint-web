import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { ProductosController } from '../controllers/productos.controller';
import { ProductosService } from '../services/productos.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new ProductosController(new ProductosService());

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `producto-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imagenes'));
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
router.get('/:id', controller.getById);
router.get('/:id/insumos', controller.getInsumos);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  upload.single('imagen'),
  validate(createSchema),
  controller.create,
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.OPERADOR),
  upload.single('imagen'),
  validate(createSchema.partial()),
  controller.update,
);
router.delete('/:id', authorize(ROLES.ADMIN), controller.remove);

export default router;
