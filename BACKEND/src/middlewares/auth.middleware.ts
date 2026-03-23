import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const SECRET = process.env.JWT_SECRET || 'constructa_secret_key_change_in_production';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }

  try {
    req.user = jwt.verify(header.slice(7), SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalido o expirado' });
  }
};
