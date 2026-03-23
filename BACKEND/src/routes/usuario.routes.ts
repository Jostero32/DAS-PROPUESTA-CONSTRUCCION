import { Router } from 'express';
import * as ctrl from '../controllers/usuario.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateUsuarioSchema, UpdateUsuarioSchema } from '../validators/usuario.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestion de usuarios
 */

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', validate(CreateUsuarioSchema), ctrl.create);
router.put('/:id', validate(UpdateUsuarioSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
