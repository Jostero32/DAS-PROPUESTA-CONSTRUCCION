# Guia de instalacion y despliegue

---

## Opcion 1: Docker Compose (recomendado)

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) o Docker Engine + Compose (Linux)
- Puertos disponibles: 4280, 3700, 5499

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd DAS-PROPUESTA-CONSTRUCCION

# 2. Levantar los 3 servicios
docker-compose up

# 3. Esperar a que los logs muestren:
#    - "Servidor corriendo en puerto 3000"
#    - "Base de datos conectada"
#    - "Angular Live Development Server is listening on 0.0.0.0:4200"
```

### URLs de acceso

| Servicio | URL | Descripcion |
|---|---|---|
| Frontend | http://localhost:4280 | Aplicacion Angular |
| Backend API | http://localhost:3700/api | API REST |
| Swagger | http://localhost:3700/api-docs | Documentacion interactiva |
| PostgreSQL | localhost:5499 | Conexion directa a la BD |

### Credenciales de prueba

El seed se ejecuta automaticamente en el primer inicio:

```
Email:    luis@obra.com
Password: Luis123!
```

### Comandos utiles

```bash
# Levantar en background
docker-compose up -d

# Ver logs de un servicio
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Detener
docker-compose down

# Detener y eliminar volumenes (reset completo de BD)
docker-compose down -v

# Rebuild (despues de cambiar package.json)
docker-compose up --build
```

---

## Opcion 2: Desarrollo local (sin Docker)

### Requisitos

- Node.js 20+ (recomendado: LTS)
- npm 10+
- PostgreSQL 15+ corriendo localmente

### 1. Configurar la base de datos

```sql
-- Conectarse a PostgreSQL y crear la BD
CREATE DATABASE constructa;
CREATE USER constructa_user WITH PASSWORD 'constructa_password';
GRANT ALL PRIVILEGES ON DATABASE constructa TO constructa_user;
```

O ajustar los valores por defecto en `BACKEND/src/config/database.ts`.

### 2. Backend

```bash
cd BACKEND
npm install

# Iniciar en modo desarrollo (hot reload con ts-node-dev)
npm run dev
```

El backend arranca en http://localhost:3700 (o el puerto en `PORT` env var, mapeado a 3700 en compose).

En el primer inicio:
- TypeORM crea las tablas automaticamente (`synchronize: true`)
- El seed inserta datos de prueba si la tabla de usuarios esta vacia

### 3. Frontend

```bash
cd FRONTEND
npm install

# Iniciar el dev server
ng serve
# o
npm start
```

El frontend arranca en http://localhost:4200 (sin Docker) o :4280 (con Docker).

> Asegurate de que `environment.ts` apunte al backend correcto:
> ```typescript
> apiUrl: 'http://localhost:3700/api'
> ```

---

## Variables de entorno

### Backend

| Variable | Default | Descripcion |
|---|---|---|
| `PORT` | 3000 | Puerto del servidor Express |
| `DB_HOST` | localhost | Host de PostgreSQL |
| `DB_PORT` | 5432 | Puerto de PostgreSQL |
| `DB_NAME` | constructa | Nombre de la base de datos |
| `DB_USER` | constructa_user | Usuario de PostgreSQL |
| `DB_PASSWORD` | constructa_password | Password de PostgreSQL |
| `JWT_SECRET` | constructa_secret_key_change_in_production | Secreto para firmar tokens JWT |
| `NODE_ENV` | development | `development` activa synchronize y logging |

### Docker Compose

Las variables se configuran en `docker-compose.yml` bajo la seccion `environment` de cada servicio. Para produccion, usar un archivo `.env`:

```bash
# .env (no commitear)
DB_NAME=constructa
DB_USER=constructa_user
DB_PASSWORD=un_password_seguro
JWT_SECRET=un_secreto_largo_y_aleatorio
```

---

## Estructura de servicios Docker

```
docker-compose.yml
│
├── db (postgres:16)
│   ├── Puerto: 5499 → 5432
│   └── Volume: db_data (persistente)
│
├── backend (node:20-alpine)
│   ├── Puerto: 3700 → 3000
│   ├── Volume: ./BACKEND → /app (hot reload)
│   ├── Volume: uploads_data → /app/uploads (fotos)
│   └── Depends on: db
│
└── frontend (node:20-alpine)
    ├── Puerto: 4280 → 4200
    ├── Volume: ./FRONTEND → /app (hot reload)
    └── Depends on: backend
```

---

## Scripts disponibles

### Backend (`BACKEND/package.json`)

| Script | Comando | Descripcion |
|---|---|---|
| `dev` | `ts-node-dev --respawn src/index.ts` | Desarrollo con hot reload |
| `build` | `tsc` | Compila TypeScript a JavaScript |
| `start` | `node dist/index.js` | Ejecuta el build compilado |
| `seed` | `npx ts-node src/seeds/seed.ts` | Ejecuta el seed manualmente |

### Frontend (`FRONTEND/package.json`)

| Script | Comando | Descripcion |
|---|---|---|
| `start` | `ng serve` | Dev server con hot reload |
| `build` | `ng build` | Build de produccion |
| `watch` | `ng build --watch` | Build continuo |

---

## Verificar que todo funciona

### 1. Health check del backend

```bash
curl http://localhost:3700/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"luis@obra.com","password":"Luis123!"}'
```

Debe devolver un JSON con `token` y `user`.

### 2. Verificar Swagger

Abrir http://localhost:3700/api-docs en el navegador. Debe mostrar la documentacion interactiva de todos los endpoints.

### 3. Verificar frontend

Abrir http://localhost:4280 en el navegador. Debe mostrar la pantalla de login de Constructa.

### 4. Conectar a la BD directamente

```bash
# Con psql
psql -h localhost -p 5499 -U constructa_user -d constructa

# O con cualquier cliente (DBeaver, pgAdmin, etc.)
# Host: localhost
# Puerto: 5499
# Base: constructa
# User: constructa_user
# Pass: constructa_password
```

---

## Problemas comunes

### El backend no conecta a la BD

- Verificar que el servicio `db` este corriendo: `docker-compose ps`
- El backend tiene retry logic (5 intentos). Si PostgreSQL tarda en iniciar, esperar unos segundos
- Verificar que el puerto 5499 no este ocupado

### El frontend no conecta al backend

- Verificar que `environment.ts` tenga `apiUrl: 'http://localhost:3700/api'`
- Si usa Docker, el proxy interno se maneja por nombre de servicio

### Error "EADDRINUSE"

Otro proceso usa el puerto. Cambiar los puertos en `docker-compose.yml` o matar el proceso:
```bash
# Ver que usa el puerto
lsof -i :3700   # Linux/Mac
netstat -ano | findstr 3700   # Windows
```

### node_modules corrupto

```bash
cd BACKEND   # o FRONTEND
rm -rf node_modules
npm install
```

Si usas Docker:
```bash
docker-compose down
docker-compose up --build
```
