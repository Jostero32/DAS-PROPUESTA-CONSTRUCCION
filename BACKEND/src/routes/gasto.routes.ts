import { Router } from 'express';
import * as ctrl from '../controllers/gasto.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateGastoSchema, UpdateGastoSchema } from '../validators/gasto.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Gastos
 *   description: CRUD plano de gastos (ver también /obras/{id}/gastos para acceso anidado)
 */

/**
 * @swagger
 * /gastos:
 *   get:
 *     tags: [Gastos]
 *     summary: Listar todos los gastos
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de gastos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gasto'
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /gastos/{id}:
 *   get:
 *     tags: [Gastos]
 *     summary: Obtener gasto por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gasto encontrado
 *       404:
 *         description: Gasto no encontrado
 */
router.get('/:id', ctrl.getById);

/**
 * @swagger
 * /gastos:
 *   post:
 *     tags: [Gastos]
 *     summary: Crear gasto
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [obra_id, concepto, monto, fecha]
 *             properties:
 *               obra_id:
 *                 type: integer
 *               concepto:
 *                 type: string
 *               monto:
 *                 type: number
 *               fecha:
 *                 type: string
 *                 format: date
 *               url_recibo_foto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gasto creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', validate(CreateGastoSchema), ctrl.create);

/**
 * @swagger
 * /gastos/{id}:
 *   put:
 *     tags: [Gastos]
 *     summary: Actualizar gasto
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
 *               concepto:
 *                 type: string
 *               monto:
 *                 type: number
 *               fecha:
 *                 type: string
 *                 format: date
 *               url_recibo_foto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gasto actualizado
 *       404:
 *         description: Gasto no encontrado
 */
router.put('/:id', validate(UpdateGastoSchema), ctrl.update);

/**
 * @swagger
 * /gastos/{id}:
 *   delete:
 *     tags: [Gastos]
 *     summary: Eliminar gasto
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Gasto eliminado
 *       404:
 *         description: Gasto no encontrado
 */
router.delete('/:id', ctrl.remove);

export default router;
