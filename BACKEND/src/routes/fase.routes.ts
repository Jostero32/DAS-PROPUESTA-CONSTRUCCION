import { Router } from 'express';
import * as ctrl from '../controllers/fase.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateFaseSchema, UpdateFaseSchema } from '../validators/fase.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Fases
 *   description: CRUD plano de fases/hitos de cobro (ver también /obras/{id}/fases para acceso anidado)
 */

/**
 * @swagger
 * /fases:
 *   get:
 *     tags: [Fases]
 *     summary: Listar todas las fases
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de fases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fase'
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /fases/{id}:
 *   get:
 *     tags: [Fases]
 *     summary: Obtener fase por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fase encontrada
 *       404:
 *         description: Fase no encontrada
 */
router.get('/:id', ctrl.getById);

/**
 * @swagger
 * /fases:
 *   post:
 *     tags: [Fases]
 *     summary: Crear fase
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [obra_id, nombre_fase, monto_a_cobrar]
 *             properties:
 *               obra_id:
 *                 type: integer
 *               nombre_fase:
 *                 type: string
 *               monto_a_cobrar:
 *                 type: number
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_progreso, cobrada]
 *               url_evidencia_foto:
 *                 type: string
 *               orden:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Fase creada
 *       400:
 *         description: Datos inválidos
 */
router.post('/', validate(CreateFaseSchema), ctrl.create);

/**
 * @swagger
 * /fases/{id}:
 *   put:
 *     tags: [Fases]
 *     summary: Actualizar fase
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_fase:
 *                 type: string
 *               monto_a_cobrar:
 *                 type: number
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_progreso, cobrada]
 *               url_evidencia_foto:
 *                 type: string
 *               orden:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Fase actualizada
 *       404:
 *         description: Fase no encontrada
 */
router.put('/:id', validate(UpdateFaseSchema), ctrl.update);

/**
 * @swagger
 * /fases/{id}:
 *   delete:
 *     tags: [Fases]
 *     summary: Eliminar fase
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Fase eliminada
 *       404:
 *         description: Fase no encontrada
 */
router.delete('/:id', ctrl.remove);

export default router;
