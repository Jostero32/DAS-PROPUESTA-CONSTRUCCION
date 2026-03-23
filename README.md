# Constructa

Sistema de gestion de obras de construccion para maestros constructores independientes. Permite administrar obras, clientes, fases de cobro, gastos de materiales y reporteria financiera desde cualquier dispositivo.

---

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| **Backend** | Node.js 20 + Express + TypeScript |
| **ORM** | TypeORM (synchronize en dev) |
| **Base de datos** | PostgreSQL 16 |
| **Validacion** | Zod |
| **Autenticacion** | JWT (jsonwebtoken + bcrypt) |
| **Documentacion API** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Frontend** | Angular 17 (standalone components, signals) |
| **UI** | Angular Material 17 (tema Indigo/Teal) |
| **Graficos** | Chart.js 4 + ng2-charts 6 |
| **PDF** | pdfkit |
| **Contenedores** | Docker + Docker Compose |

---

## Inicio rapido

### Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose
- (Opcional) Node.js 20+ para desarrollo local sin Docker

### Levantar con Docker (recomendado)

```bash
git clone <repo-url>
cd DAS-PROPUESTA-CONSTRUCCION
docker-compose up
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4280 |
| Backend API | http://localhost:3700/api |
| Swagger docs | http://localhost:3700/api-docs |
| PostgreSQL | localhost:5499 |

### Credenciales de prueba

El seed se ejecuta automaticamente al iniciar por primera vez:

| Campo | Valor |
|---|---|
| Email | `luis@obra.com` |
| Password | `Luis123!` |

### Desarrollo local (sin Docker)

```bash
# Terminal 1 — Backend
cd BACKEND
npm install
npm run dev          # http://localhost:3700

# Terminal 2 — Frontend
cd FRONTEND
npm install
ng serve             # http://localhost:4280
```

> Requiere PostgreSQL corriendo en localhost:5432 con la base `constructa`.

---

## Estructura del proyecto

```
.
├── BACKEND/
│   └── src/
│       ├── config/          # DataSource, Swagger
│       ├── controllers/     # Logica de negocio
│       ├── entities/        # 5 entidades TypeORM
│       ├── middlewares/      # Auth, validacion, upload
│       ├── routes/           # Rutas Express + JSDoc Swagger
│       ├── seeds/            # Datos de prueba
│       ├── services/         # Generacion PDF
│       ├── validators/       # Esquemas Zod
│       └── index.ts
├── FRONTEND/
│   └── src/app/
│       ├── core/            # Servicios, guards, interceptors, modelos
│       ├── features/        # Login, Dashboard, ObraDetalle
│       ├── shared/          # Layout, Sidebar, CRUD generico, Dialogs
│       └── app.routes.ts
├── DOCS/                    # Documentacion completa
├── docker-compose.yml
└── .gitignore
```

---

## Documentacion

| Documento | Descripcion |
|---|---|
| [Arquitectura](DOCS/ARQUITECTURA.md) | Diagramas del sistema, capas backend/frontend, flujo de datos |
| [Funcionalidades](DOCS/FUNCIONALIDADES.md) | Modulos, flujos de usuario y reglas de negocio |
| [Modelo de datos](DOCS/MODELO_DATOS.md) | Entidades, ERD, campos y relaciones |
| [API Reference](DOCS/API.md) | Todos los endpoints con request/response |
| [Guia de instalacion](DOCS/GUIA_INSTALACION.md) | Setup detallado, Docker, variables de entorno |
| [Diseno original (21 entidades)](DOCS/README_ENTIDADES.md) | Documento de diseno teorico completo |
| [DDL original](DOCS/README_SQL.md) | Schema SQL del diseno teorico con ERD Mermaid |

---

## Licencia

Proyecto privado. Todos los derechos reservados.
