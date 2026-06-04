import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { ConfiguracionController } from '../controllers/configuracion.controller';
import { ConfiguracionService } from '../services/configuracion.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new ConfiguracionController(new ConfiguracionService());

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `logo-${unique}${path.extname(file.originalname)}`);
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

const updateSchema = z.object({
  updates: z
    .array(
      z.object({
        clave: z.string().min(1).max(100),
        valor: z.union([z.string(), z.number(), z.boolean()]),
      }),
    )
    .min(1),
});

router.get('/', controller.getAll);
router.get('/:grupo', controller.getByGrupo);
router.put(
  '/',
  authorize(ROLES.ADMIN),
  validate(updateSchema),
  controller.updateMany,
);
router.post(
  '/logo',
  authorize(ROLES.ADMIN),
  upload.single('logo'),
  controller.uploadLogo,
);

export default router;
