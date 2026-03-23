import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';

import authRoutes from './auth.routes';
import uploadRoutes from './upload.routes';
import usuarioRoutes from './usuario.routes';
import clienteRoutes from './cliente.routes';
import obraRoutes from './obra.routes';
import faseRoutes from './fase.routes';
import gastoRoutes from './gasto.routes';
import reportesRoutes from './reportes.routes';

const router = Router();

// Publico
router.use('/auth', authRoutes);

// Todo lo demas requiere JWT
router.use(authMiddleware);

router.use('/upload', uploadRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/obras', obraRoutes);
router.use('/fases', faseRoutes);
router.use('/gastos', gastoRoutes);
router.use('/reportes', reportesRoutes);

export default router;
