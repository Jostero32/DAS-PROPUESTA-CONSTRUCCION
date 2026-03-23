import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { Usuario } from '../entities/Usuario';

const SECRET = process.env.JWT_SECRET || 'constructa_secret_key_change_in_production';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y password son requeridos' });
      return;
    }

    const repo = AppDataSource.getRepository(Usuario);
    const user = await repo.findOneBy({ email });

    if (!user) {
      res.status(401).json({ message: 'Credenciales invalidas' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ message: 'Credenciales invalidas' });
      return;
    }

    if (!user.activo) {
      res.status(403).json({ message: 'Usuario inactivo' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: '8h' },
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
      },
    });
  } catch (e) {
    res.status(500).json({ message: 'Error en el login', error: String(e) });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = AppDataSource.getRepository(Usuario);
    const user = await repo.findOneBy({ id: req.user!.id });
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    const { password_hash, ...data } = user;
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: 'Error', error: String(e) });
  }
};
