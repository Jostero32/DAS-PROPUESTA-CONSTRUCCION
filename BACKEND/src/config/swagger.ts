import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const apis =
  process.env.NODE_ENV === 'production'
    ? [path.join(__dirname, '../routes/*.js')]
    : [path.join(__dirname, '../routes/*.ts')];

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Constructa API',
      version: '1.0.0',
      description: 'API REST de Constructa para gestión de proyectos de construcción.',
    },
    servers: [{ url: '/api', description: 'API Server' }],
  },
  apis,
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/api-docs.json', (_req, res) => res.json(spec));
}
