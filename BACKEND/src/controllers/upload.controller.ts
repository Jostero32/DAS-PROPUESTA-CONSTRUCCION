import { Request, Response } from 'express';

/** POST /upload — Devuelve la URL pública del archivo subido */
export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No se recibio ningun archivo' });
    return;
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({ url });
};
