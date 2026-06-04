import { Router } from 'express';
import { z } from 'zod';
import { AbonosController } from '../controllers/abonos.controller';
import { AbonosService } from '../services/abonos.service';
import { validate } from '../middleware/validate.middleware';
import { authorizePermission } from '../middleware/rbac.middleware';

const router = Router();
const controller = new AbonosController(new AbonosService());

const abonoSchema = z.object({
  monto: z.number().positive(),
  metodo_pago: z.string().min(1).max(30),
  notas: z.string().max(255).optional(),
});

router.get('/venta/:ventaId', authorizePermission('abonos', 'ver'), controller.getByVenta);
router.post('/venta/:ventaId', authorizePermission('abonos', 'registrar'), validate(abonoSchema), controller.registrar);
router.delete('/:id', authorizePermission('abonos', 'registrar'), controller.remove);

export default router;
