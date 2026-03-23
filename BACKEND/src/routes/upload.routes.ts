import { Router } from 'express';
import { uploadSingleFoto, handleUploadError } from '../middlewares/upload.middleware';
import { uploadFile } from '../controllers/upload.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Subida de fotos (evidencia de fases, recibos de gastos)
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     tags: [Upload]
 *     summary: Subir una imagen
 *     description: |
 *       Sube una foto y devuelve su URL publica.
 *       Formatos: JPEG, PNG, WebP, HEIC. Max 5 MB.
 *       La URL retornada se usa en los campos url_evidencia_foto (fases)
 *       o url_recibo_foto (gastos).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [foto]
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen (max 5 MB)
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: http://localhost:3000/uploads/1711234567890-a1b2c3d4e5f6.jpg
 *       400:
 *         description: Sin archivo, tipo no permitido, o excede el limite
 *       401:
 *         description: Token requerido
 */
router.post('/', uploadSingleFoto, handleUploadError, uploadFile);

export default router;
