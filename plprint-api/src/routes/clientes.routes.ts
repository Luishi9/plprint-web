import { Router } from 'express';
import { z } from 'zod';
import { ClientesController } from '../controllers/clientes.controller';
import { ClientesService } from '../services/clientes.service';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const controller = new ClientesController(new ClientesService());

const clienteSchema = z.object({
  nombre: z.string().min(1).max(150),
  telefono: z.string().max(20).optional(),
  email: z.string().email().optional(),
  direccion: z.string().optional(),
});

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.get('/:id/historial', controller.getHistorial);
router.post('/', validate(clienteSchema), controller.create);
router.put('/:id', validate(clienteSchema.partial()), controller.update);
router.delete('/:id', controller.remove);

export default router;
