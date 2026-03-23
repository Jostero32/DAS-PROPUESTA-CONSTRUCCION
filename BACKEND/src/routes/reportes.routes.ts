import { Router } from 'express';
import * as ctrl from '../controllers/reportes.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Reporteria financiera del maestro autenticado
 */

/**
 * @swagger
 * /reportes/resumen-obra/{obraId}:
 *   get:
 *     tags: [Reportes]
 *     summary: Resumen financiero de una obra
 *     description: |
 *       Calcula en tiempo real usando agregaciones SQL:
 *       - Presupuesto total del contrato (mano de obra + anticipo)
 *       - Total gastado y saldo de anticipo
 *       - Total cobrado vs total por cobrar (basado en fases)
 *       - Progreso de cobro y rentabilidad
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: obraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la obra
 *     responses:
 *       200:
 *         description: Resumen financiero completo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 obra_id:
 *                   type: integer
 *                 obra_nombre:
 *                   type: string
 *                 estado:
 *                   type: string
 *                 presupuesto:
 *                   type: object
 *                   properties:
 *                     mano_de_obra:
 *                       type: number
 *                     anticipo_materiales:
 *                       type: number
 *                     total_contrato:
 *                       type: number
 *                 gastos:
 *                   type: object
 *                   properties:
 *                     total_gastado:
 *                       type: number
 *                     cantidad_gastos:
 *                       type: integer
 *                     saldo_anticipo:
 *                       type: number
 *                 cobros:
 *                   type: object
 *                   properties:
 *                     total_cobrado:
 *                       type: number
 *                     total_por_cobrar:
 *                       type: number
 *                     fases_cobradas:
 *                       type: integer
 *                     fases_pendientes:
 *                       type: integer
 *                     fases_en_progreso:
 *                       type: integer
 *                     fases_total:
 *                       type: integer
 *                     progreso_porcentaje:
 *                       type: number
 *                 balance:
 *                   type: object
 *                   properties:
 *                     ingreso_neto:
 *                       type: number
 *                     rentabilidad_porcentaje:
 *                       type: number
 *       404:
 *         description: Obra no encontrada
 */
router.get('/resumen-obra/:obraId', ctrl.resumenObra);

/**
 * @swagger
 * /reportes/gastos-mensuales:
 *   get:
 *     tags: [Reportes]
 *     summary: Gastos agrupados por mes
 *     description: |
 *       Agrupa y suma todos los gastos de las obras del maestro autenticado
 *       por mes del año indicado (o el año actual).
 *       Retorna los 12 meses incluidos aquellos sin gastos (total: 0).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *         description: Año a consultar (default = año actual)
 *         example: 2026
 *     responses:
 *       200:
 *         description: Gastos agrupados por mes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anio:
 *                   type: integer
 *                 total_anual:
 *                   type: number
 *                 cantidad_anual:
 *                   type: integer
 *                 meses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       anio:
 *                         type: integer
 *                       mes:
 *                         type: integer
 *                       mes_nombre:
 *                         type: string
 *                       total:
 *                         type: number
 *                       cantidad:
 *                         type: integer
 */
router.get('/gastos-mensuales', ctrl.gastosMensuales);

export default router;
