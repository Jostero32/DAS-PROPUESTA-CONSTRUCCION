import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan imagenes (JPEG, PNG, WebP, HEIC).`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/** Middleware que procesa un solo archivo en el campo 'foto' */
export const uploadSingleFoto = upload.single('foto');

/** Error handler para multer (convierte errores de multer en respuestas HTTP) */
export const handleUploadError = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'El archivo excede el limite de 5 MB' });
      return;
    }
    res.status(400).json({ message: `Error de carga: ${err.message}` });
    return;
  }
  if (err.message.includes('Tipo de archivo no permitido')) {
    res.status(400).json({ message: err.message });
    return;
  }
  next(err);
};

export { UPLOADS_DIR };
