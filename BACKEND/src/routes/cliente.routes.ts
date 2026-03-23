import { Router } from 'express';
import * as ctrl from '../controllers/cliente.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateClienteSchema, UpdateClienteSchema } from '../validators/cliente.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestion de clientes
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Listar clientes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Obtener cliente por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cliente encontrado
 */
router.get('/:id', ctrl.getById);

/**
 * @swagger
 * /clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Crear cliente
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usuario_id, nombre]
 *             properties:
 *               usuario_id: { type: integer }
 *               nombre: { type: string }
 *               telefono: { type: string }
 *               direccion: { type: string }
 *               notas: { type: string }
 *     responses:
 *       201:
 *         description: Cliente creado
 */
router.post('/', validate(CreateClienteSchema), ctrl.create);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Actualizar cliente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.put('/:id', validate(UpdateClienteSchema), ctrl.update);

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     tags: [Clientes]
 *     summary: Eliminar cliente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */
router.delete('/:id', ctrl.remove);

export default router;
