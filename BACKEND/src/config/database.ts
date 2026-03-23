import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

import { Usuario } from '../entities/Usuario';
import { Cliente } from '../entities/Cliente';
import { Obra } from '../entities/Obra';
import { Fase } from '../entities/Fase';
import { Gasto } from '../entities/Gasto';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'constructa_user',
  password: process.env.DB_PASSWORD || 'constructa_password',
  database: process.env.DB_NAME || 'constructa',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Usuario, Cliente, Obra, Fase, Gasto],
});
