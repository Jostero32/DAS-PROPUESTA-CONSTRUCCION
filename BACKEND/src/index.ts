import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { AppDataSource } from './config/database';
import { setupSwagger } from './config/swagger';
import { errorMiddleware } from './middlewares/error.middleware';
import router from './routes';
import { runSeed } from './seeds/seed';
import { UPLOADS_DIR } from './middlewares/upload.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:4280', 'http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Crear directorio de uploads si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Servir archivos estáticos de /uploads
app.use('/uploads', express.static(UPLOADS_DIR));

setupSwagger(app);
app.use('/api', router);
app.use(errorMiddleware);

async function connectWithRetry(retries = 10, delay = 3000): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await AppDataSource.initialize();
      console.log('Base de datos conectada');
      return;
    } catch (err) {
      console.log(`Intento ${i}/${retries} - DB no disponible, reintentando en ${delay / 1000}s...`);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

connectWithRetry()
  .then(() => runSeed())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a la base de datos:', err);
    process.exit(1);
  });
