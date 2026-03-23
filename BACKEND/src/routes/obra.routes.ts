import { Router } from 'express';
import * as ctrl from '../controllers/obra.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateObraSchema, UpdateObraSchema, CambiarEstadoObraSchema } from '../validators/obra.validator';
import { ActualizarFaseCobroSchema, CreateFaseSchema } from '../validators/fase.validator';
import { AgregarGastoSchema } from '../validators/gasto.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Obras
 *   description: Gestión de obras del maestro autenticado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Obra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         usuario_id:
 *           type: integer
 *         cliente_id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         presupuesto_mano_obra:
 *           type: number
 *         anticipo_materiales:
 *           type: number
 *         estado:
 *           type: string
 *           enum: [pendiente, en_progreso, completada, cancelada]
 *         fecha_inicio:
 *           type: string
 *           format: date
 *         fecha_fin:
 *           type: string
 *           format: date
 *     ObraResumen:
 *       allOf:
 *         - $ref: '#/components/schemas/Obra'
 *         - type: object
 *           properties:
 *             total_fases:
 *               type: integer
 *             fases_cobradas:
 *               type: integer
 *             total_gastado:
 *               type: number
 *             cliente_nombre:
 *               type: string
 *     ObraDetalle:
 *       allOf:
 *         - $ref: '#/components/schemas/Obra'
 *         - type: object
 *           properties:
 *             fases:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fase'
 *             gastos:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gasto'
 *             total_fases:
 *               type: integer
 *             fases_cobradas:
 *               type: integer
 *             monto_cobrado:
 *               type: number
 *             monto_pendiente:
 *               type: number
 *             total_gastado:
 *               type: number
 *             saldo_anticipo:
 *               type: number
 *     Fase:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         obra_id:
 *           type: integer
 *         nombre_fase:
 *           type: string
 *         monto_a_cobrar:
 *           type: number
 *         estado:
 *           type: string
 *           enum: [pendiente, en_progreso, cobrada]
 *         url_evidencia_foto:
 *           type: string
 *         orden:
 *           type: integer
 *     Gasto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         obra_id:
 *           type: integer
 *         concepto:
 *           type: string
 *         monto:
 *           type: number
 *         fecha:
 *           type: string
 *           format: date
 *         url_recibo_foto:
 *           type: string
 *     CreateObra:
 *       type: object
 *       required: [cliente_id, nombre, presupuesto_mano_obra]
 *       properties:
 *         cliente_id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         presupuesto_mano_obra:
 *           type: number
 *         anticipo_materiales:
 *           type: number
 *         estado:
 *           type: string
 *           enum: [pendiente, en_progreso, completada, cancelada]
 *         fecha_inicio:
 *           type: string
 *           format: date
 *         fecha_fin:
 *           type: string
 *           format: date
 */

// ─── CRUD de Obra ───────────────────────────────────────────────

/**
 * @swagger
 * /obras:
 *   get:
 *     tags: [Obras]
 *     summary: Listar mis obras
 *     description: Devuelve las obras del maestro autenticado con resumen de fases y gastos
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de obras con resumen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ObraResumen'
 *       401:
 *         description: Token requerido o invalido
 */
router.get('/', ctrl.getMisObras);

/**
 * @swagger
 * /obras/{id}:
 *   get:
 *     tags: [Obras]
 *     summary: Detalle de una obra
 *     description: Devuelve la obra con todas sus fases (ordenadas) y gastos, más métricas calculadas
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la obra
 *     responses:
 *       200:
 *         description: Detalle completo de la obra
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ObraDetalle'
 *       404:
 *         description: Obra no encontrada
 */
router.get('/:id', ctrl.getObraDetalle);

/**
 * @swagger
 * /obras:
 *   post:
 *     tags: [Obras]
 *     summary: Crear una obra
 *     description: Crea una nueva obra asignada automáticamente al maestro autenticado (usuario_id viene del JWT)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateObra'
 *     responses:
 *       201:
 *         description: Obra creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Obra'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', validate(CreateObraSchema), ctrl.crearObra);

/**
 * @swagger
 * /obras/{id}:
 *   put:
 *     tags: [Obras]
 *     summary: Actualizar una obra
 *     description: Actualiza los datos de una obra del maestro autenticado
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
 *             $ref: '#/components/schemas/CreateObra'
 *     responses:
 *       200:
 *         description: Obra actualizada
 *       404:
 *         description: Obra no encontrada
 */
router.put('/:id', validate(UpdateObraSchema), ctrl.actualizarObra);

/**
 * @swagger
 * /obras/{id}/estado:
 *   patch:
 *     tags: [Obras]
 *     summary: Cambiar estado de una obra
 *     description: Cambia solo el estado de una obra (pendiente → en_progreso → completada)
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
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_progreso, completada, cancelada]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Obra no encontrada
 */
router.patch('/:id/estado', validate(CambiarEstadoObraSchema), ctrl.cambiarEstado);

/**
 * @swagger
 * /obras/{id}:
 *   delete:
 *     tags: [Obras]
 *     summary: Eliminar una obra
 *     description: Elimina una obra solo si no tiene fases cobradas
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Obra eliminada
 *       400:
 *         description: No se puede eliminar (tiene fases cobradas)
 *       404:
 *         description: Obra no encontrada
 */
router.delete('/:id', ctrl.eliminarObra);

// ─── Contrato PDF ───────────────────────────────────────────────

/**
 * @swagger
 * /obras/{id}/contrato-pdf:
 *   get:
 *     tags: [Obras]
 *     summary: Descargar Hoja de Obra (PDF)
 *     description: |
 *       Genera y descarga un PDF con el contrato simplificado de la obra.
 *       Incluye datos del maestro y cliente, descripcion de la obra,
 *       resumen financiero, y tabla de fases con montos de cobro.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la obra
 *     responses:
 *       200:
 *         description: Archivo PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Obra no encontrada
 */
router.get('/:id/contrato-pdf', ctrl.generarContrato);

// ─── Subrutas: Fases de una Obra ────────────────────────────────

/**
 * @swagger
 * /obras/{id}/fases:
 *   get:
 *     tags: [Obras - Fases]
 *     summary: Listar fases de una obra
 *     description: Devuelve las fases/hitos de cobro de una obra ordenadas por campo 'orden'
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la obra
 *     responses:
 *       200:
 *         description: Lista de fases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fase'
 *       404:
 *         description: Obra no encontrada
 */
router.get('/:id/fases', ctrl.listarFasesDeObra);

/**
 * @swagger
 * /obras/{id}/fases:
 *   post:
 *     tags: [Obras - Fases]
 *     summary: Agregar fase a una obra
 *     description: Crea un nuevo hito de cobro para la obra especificada
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
 *             required: [nombre_fase, monto_a_cobrar]
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
 *       201:
 *         description: Fase creada
 *       404:
 *         description: Obra no encontrada
 */
router.post('/:id/fases', ctrl.agregarFase);

/**
 * @swagger
 * /obras/{id}/fases/{faseId}:
 *   patch:
 *     tags: [Obras - Fases]
 *     summary: Actualizar estado/evidencia de una fase
 *     description: Permite al maestro marcar el avance de un hito de cobro y adjuntar foto de evidencia
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la obra
 *       - in: path
 *         name: faseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la fase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_progreso, cobrada]
 *               url_evidencia_foto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fase actualizada
 *       404:
 *         description: Obra o fase no encontrada
 */
router.patch('/:id/fases/:faseId', validate(ActualizarFaseCobroSchema), ctrl.actualizarFaseCobro);

// ─── Subrutas: Gastos de una Obra ───────────────────────────────

/**
 * @swagger
 * /obras/{id}/gastos:
 *   get:
 *     tags: [Obras - Gastos]
 *     summary: Listar gastos de una obra
 *     description: Devuelve la libreta de gastos del anticipo de materiales, ordenados por fecha descendente
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la obra
 *     responses:
 *       200:
 *         description: Lista de gastos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gasto'
 *       404:
 *         description: Obra no encontrada
 */
router.get('/:id/gastos', ctrl.listarGastosDeObra);

/**
 * @swagger
 * /obras/{id}/gastos:
 *   post:
 *     tags: [Obras - Gastos]
 *     summary: Agregar gasto a una obra
 *     description: Registra un nuevo gasto en la libreta de materiales de la obra. El obra_id se toma del path.
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
 *             required: [concepto, monto, fecha]
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
 *       201:
 *         description: Gasto registrado
 *       404:
 *         description: Obra no encontrada
 */
router.post('/:id/gastos', validate(AgregarGastoSchema), ctrl.agregarGasto);

export default router;
