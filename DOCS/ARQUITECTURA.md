# Arquitectura del sistema

---

## Diagrama general

```mermaid
graph TB
    subgraph Cliente["Navegador / Celular"]
        FE["Angular 17<br/>Material + Signals"]
    end

    subgraph Docker["Docker Compose"]
        subgraph FrontContainer["constructa_frontend :4280"]
            NG["ng serve<br/>(dev server)"]
        end

        subgraph BackContainer["constructa_backend :3700"]
            EX["Express API"]
            SW["Swagger UI"]
            PDF["pdfkit"]
            ML["Multer<br/>(uploads)"]
        end

        subgraph DBContainer["constructa_db :5499"]
            PG["PostgreSQL 16"]
        end
    end

    FE -->|HTTP / JWT| NG
    NG -->|proxy| EX
    EX -->|TypeORM| PG
    EX --> SW
    EX --> PDF
    EX --> ML
```

---

## Capas del backend

```mermaid
graph LR
    REQ["Request HTTP"] --> MW["Middlewares"]
    MW --> RT["Routes"]
    RT --> CT["Controllers"]
    CT --> EN["Entities / TypeORM"]
    EN --> DB["PostgreSQL"]

    MW --> |auth| JWT["JWT Verify"]
    MW --> |validate| ZOD["Zod Schema"]
    MW --> |upload| MU["Multer"]
    CT --> |pdf| PDK["pdfkit Service"]
```

### Detalle de cada capa

| Capa | Responsabilidad | Archivos |
|---|---|---|
| **Middlewares** | Autenticacion JWT, validacion Zod, manejo de uploads, errores globales | `src/middlewares/` |
| **Routes** | Definicion de endpoints, Swagger JSDoc, binding a controllers | `src/routes/` |
| **Controllers** | Logica de negocio, queries, ownership check, respuestas HTTP | `src/controllers/` |
| **Entities** | Definicion de tablas, relaciones, columnas TypeORM | `src/entities/` |
| **Validators** | Esquemas Zod con mensajes en español | `src/validators/` |
| **Services** | Generacion de PDF (contrato) | `src/services/` |
| **Config** | DataSource TypeORM, Swagger setup | `src/config/` |

### CRUD Factory

Para entidades simples (Usuario, Cliente), existe un patron factory en `crud.factory.ts` que genera operaciones CRUD estandar (getAll, getById, create, update, remove) sin repetir codigo. Las entidades con logica de negocio compleja (Obra) tienen controllers dedicados.

---

## Capas del frontend

```mermaid
graph LR
    USR["Usuario"] --> CMP["Components"]
    CMP --> STO["Stores / Signals"]
    STO --> SRV["Services HTTP"]
    SRV -->|HttpClient| API["Backend API"]

    CMP --> DLG["Dialog Components"]
    CMP --> MAT["Angular Material"]
    STO --> COM["Computed Signals"]
```

### Detalle de cada capa

| Capa | Responsabilidad | Ubicacion |
|---|---|---|
| **Features** | Componentes de pagina (Dashboard, ObraDetalle, Login) | `features/` |
| **Shared** | Layout, Sidebar, CrudPage generico, Dialogs | `shared/components/` |
| **Services** | Llamadas HTTP tipadas (ObraService, ReporteService, AuthService) | `core/services/` |
| **Store** | Estado reactivo con Signals (MaestroStore) | `core/services/maestro.store.ts` |
| **Models** | Interfaces TypeScript que matchean el backend | `core/models/` |
| **Guards** | Proteccion de rutas (authGuard) | `core/guards/` |
| **Interceptors** | Inyeccion automatica del token JWT | `core/interceptors/` |

### Patron de estado: Signals

El `MaestroStore` usa Angular Signals (no NgRx/RxJS stores) para un estado reactivo ligero:

```
signal(obras)          → lista de obras del maestro
signal(obraSeleccionada) → obra actualmente visualizada
computed(obrasActivas)   → filtro: estado != cancelada
computed(resumenFinanciero) → totales calculados en tiempo real
computed(progresoCobro)  → porcentaje de fases cobradas
```

Las acciones (cargar, crear, actualizar) usan ObraService internamente y actualizan los signals de forma optimista.

### Patron CRUD generico

Las paginas de CRUD (Clientes, Obras, Fases, Gastos) se generan a partir de un `entities.config.ts` que define:

```typescript
{
  title: 'Clientes',
  apiPath: 'clientes',
  columns: [
    { key: 'nombre', label: 'Nombre' },
    { key: 'telefono', label: 'Telefono' },
    ...
  ],
  formFields: [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'usuario_id', label: 'Usuario', type: 'select', entitySource: 'usuarios' },
    ...
  ]
}
```

Un solo `CrudPageComponent` + `EntityFormDialogComponent` renderiza cualquier entidad.

---

## Flujo de autenticacion

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as Backend
    participant DB as PostgreSQL

    U->>FE: Email + Password
    FE->>BE: POST /api/auth/login
    BE->>DB: SELECT usuario WHERE email
    DB-->>BE: Usuario (con hash)
    BE->>BE: bcrypt.compare(password, hash)
    BE-->>FE: { token: JWT, user: {...} }
    FE->>FE: localStorage.set('constructa_token')
    Note over FE: Interceptor añade<br/>Authorization: Bearer {token}<br/>a cada request
    FE->>BE: GET /api/obras (con Bearer token)
    BE->>BE: jwt.verify(token)
    BE->>DB: SELECT obras WHERE usuario_id = token.id
    DB-->>BE: [obras]
    BE-->>FE: [obras con resumen]
```

---

## Flujo de subida de archivos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as Backend
    participant FS as /uploads (volume)

    U->>FE: Selecciona foto (camara/galeria)
    FE->>BE: POST /api/upload (multipart/form-data)
    BE->>BE: Multer: valida tipo + tamaño (5MB max)
    BE->>FS: Guarda archivo con nombre unico
    BE-->>FE: { url: "http://host/uploads/abc123.jpg" }
    FE->>FE: Usa URL en el formulario de fase/gasto
    FE->>BE: POST /api/obras/:id/gastos { url_recibo_foto: url }
```

---

## Infraestructura Docker

```mermaid
graph TB
    subgraph Volumes
        V1["db_data<br/>(PostgreSQL)"]
        V2["uploads_data<br/>(fotos)"]
    end

    subgraph Services
        DB["constructa_db<br/>postgres:16<br/>:5499→5432"]
        BK["constructa_backend<br/>node:20-alpine<br/>:3700→3000"]
        FR["constructa_frontend<br/>node:20-alpine<br/>:4280→4200"]
    end

    FR -->|depends_on| BK
    BK -->|depends_on| DB
    DB --- V1
    BK --- V2
    BK -.->|hot reload| SRC1["./BACKEND (mount)"]
    FR -.->|hot reload| SRC2["./FRONTEND (mount)"]
```

| Servicio | Imagen | Puerto externo | Puerto interno |
|---|---|---|---|
| `constructa_db` | postgres:16 | 5499 | 5432 |
| `constructa_backend` | node:20-alpine | 3700 | 3000 |
| `constructa_frontend` | node:20-alpine | 4280 | 4200 |

### Volumenes

- **db_data** — Persistencia de PostgreSQL entre reinicios
- **uploads_data** — Fotos de evidencias y recibos
- **./BACKEND** y **./FRONTEND** — Mount de codigo fuente para hot reload en desarrollo
