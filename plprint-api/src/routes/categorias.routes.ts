import { Router } from 'express';
import { z } from 'zod';
import { CategoriasController } from '../controllers/categorias.controller';
import { CategoriasService } from '../services/categorias.service';
import { validate } from '../middleware/validate.middleware';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new CategoriasController(new CategoriasService());

const categoriaSchema = z.object({
  nombre: z.string().min(1).max(100),
  tipo: z.enum(['venta', 'produccion']).default('venta'),
  descripcion: z.string().max(255).optional(),
});

router.get('/', controller.getAll);
router.post('/', authorize(ROLES.ADMIN), validate(categoriaSchema), controller.create);
router.put('/:id', authorize(ROLES.ADMIN), validate(categoriaSchema), controller.update);
router.delete('/:id', authorize(ROLES.ADMIN), controller.remove);

export default router;
