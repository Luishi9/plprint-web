import { Router } from 'express';
import { RespaldoController } from '../controllers/respaldo.controller';
import { RespaldoService } from '../services/respaldo.service';
import { authorize, ROLES } from '../middleware/rbac.middleware';

const router = Router();
const controller = new RespaldoController(new RespaldoService());

router.get('/', authorize(ROLES.ADMIN), controller.generate);
router.get('/list', authorize(ROLES.ADMIN), controller.list);
router.get('/stats', authorize(ROLES.ADMIN), controller.stats);
router.get('/download/:filename', authorize(ROLES.ADMIN), controller.download);
router.delete('/:filename', authorize(ROLES.ADMIN), controller.remove);

export default router;
