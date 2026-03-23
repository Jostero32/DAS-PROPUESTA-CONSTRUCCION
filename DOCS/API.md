# API Reference

Base URL: `http://localhost:3700/api`

Swagger interactivo: `http://localhost:3700/api-docs`

Todas las rutas (excepto `/auth/login`) requieren el header:
```
Authorization: Bearer <jwt_token>
```

---

## Indice

- [Autenticacion](#autenticacion)
- [Obras](#obras)
- [Fases (nested en obra)](#fases-nested-en-obra)
- [Gastos (nested en obra)](#gastos-nested-en-obra)
- [Fases (CRUD plano)](#fases-crud-plano)
- [Gastos (CRUD plano)](#gastos-crud-plano)
- [Clientes](#clientes)
- [Usuarios](#usuarios)
- [Upload](#upload)
- [Reportes](#reportes)

---

## Autenticacion

### POST /auth/login

Autentica al usuario y devuelve un JWT.

**Request:**
```json
{
  "email": "luis@obra.com",
  "password": "Luis123!"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "nombre": "Luis Martinez",
    "email": "luis@obra.com",
    "telefono": "0987654321"
  }
}
```

**Response 401:** `{ "message": "Credenciales invalidas" }`

---

### GET /auth/me

Devuelve los datos del usuario autenticado (sin password_hash).

**Response 200:**
```json
{
  "id": 1,
  "nombre": "Luis Martinez",
  "email": "luis@obra.com",
  "telefono": "0987654321",
  "activo": true,
  "created_at": "2026-03-01T...",
  "updated_at": "2026-03-01T..."
}
```

---

## Obras

### GET /obras

Lista todas las obras del maestro autenticado con resumen calculado.

**Response 200:**
```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "cliente_id": 1,
    "nombre": "Ampliacion segundo piso",
    "descripcion": "Construir segunda planta sobre losa existente",
    "presupuesto_mano_obra": 4500,
    "anticipo_materiales": 3000,
    "estado": "en_progreso",
    "fecha_inicio": "2026-02-15",
    "fecha_fin": null,
    "total_fases": 4,
    "fases_cobradas": 1,
    "total_gastado": 1913,
    "cliente_nombre": "Sra. Martha Paredes",
    "cliente": { "id": 1, "nombre": "Sra. Martha Paredes", "telefono": "0991234567" },
    "fases": [...]
  }
]
```

---

### GET /obras/:id

Detalle completo de una obra: datos + fases (ordenadas) + gastos (por fecha) + metricas.

**Response 200:**
```json
{
  "id": 1,
  "nombre": "Ampliacion segundo piso",
  "presupuesto_mano_obra": 4500,
  "anticipo_materiales": 3000,
  "estado": "en_progreso",
  "cliente": { "id": 1, "nombre": "Sra. Martha Paredes" },
  "fases": [
    { "id": 1, "nombre_fase": "Cimentacion completada", "monto_a_cobrar": 1200, "estado": "cobrada", "orden": 1 },
    { "id": 2, "nombre_fase": "Paredes de bloque", "monto_a_cobrar": 1000, "estado": "en_progreso", "orden": 2 }
  ],
  "gastos": [
    { "id": 1, "concepto": "20 sacos cemento", "monto": 160, "fecha": "2026-02-20" }
  ],
  "total_fases": 4,
  "fases_cobradas": 1,
  "total_gastado": 1913,
  "monto_cobrado": 1200,
  "monto_pendiente": 3300,
  "saldo_anticipo": 1087
}
```

**Response 404:** `{ "message": "Obra no encontrada" }`

---

### POST /obras

Crea una nueva obra. El `usuario_id` se asigna automaticamente desde el JWT.

**Request:**
```json
{
  "cliente_id": 1,
  "nombre": "Remodelacion cocina",
  "descripcion": "Cambio de pisos y mesones",
  "presupuesto_mano_obra": 2800,
  "anticipo_materiales": 1500,
  "estado": "pendiente",
  "fecha_inicio": "2026-04-01"
}
```

**Response 201:** La obra creada con todos sus campos.

---

### PUT /obras/:id

Actualiza una obra existente. Solo el dueño puede modificarla.

**Request:** Campos parciales (cualquier subset de los campos de creacion).

**Response 200:** La obra actualizada.

---

### PATCH /obras/:id/estado

Cambia unicamente el estado de una obra.

**Request:**
```json
{
  "estado": "en_progreso"
}
```

**Response 200:** La obra con el nuevo estado.

---

### DELETE /obras/:id

Elimina una obra. Falla si tiene fases en estado `cobrada`.

**Response 200:** `{ "message": "Obra eliminada" }`

**Response 400:** `{ "message": "No se puede eliminar: tiene 2 fase(s) cobrada(s)" }`

---

### GET /obras/:id/contrato-pdf

Genera y descarga un PDF "Hoja de Obra".

**Response 200:** `Content-Type: application/pdf` (stream binario)

---

## Fases (nested en obra)

### GET /obras/:id/fases

Lista las fases de una obra ordenadas por campo `orden`.

**Response 200:**
```json
[
  { "id": 1, "nombre_fase": "Cimentacion completada", "monto_a_cobrar": 1200, "estado": "cobrada", "orden": 1, "url_evidencia_foto": "http://..." },
  { "id": 2, "nombre_fase": "Paredes de bloque", "monto_a_cobrar": 1000, "estado": "en_progreso", "orden": 2, "url_evidencia_foto": null }
]
```

---

### POST /obras/:id/fases

Agrega una fase a una obra. El `obra_id` se toma del path.

**Request:**
```json
{
  "nombre_fase": "Instalacion electrica",
  "monto_a_cobrar": 800,
  "estado": "pendiente",
  "orden": 5
}
```

**Response 201:** La fase creada.

---

### PATCH /obras/:id/fases/:faseId

Actualiza el estado y/o evidencia de una fase.

**Request:**
```json
{
  "estado": "cobrada",
  "url_evidencia_foto": "http://localhost:3700/uploads/evidencia_123.jpg"
}
```

**Response 200:** La fase actualizada.

---

## Gastos (nested en obra)

### GET /obras/:id/gastos

Lista los gastos de una obra ordenados por fecha descendente.

**Response 200:**
```json
[
  { "id": 1, "concepto": "20 sacos cemento", "monto": 160, "fecha": "2026-03-15", "url_recibo_foto": null },
  { "id": 2, "concepto": "Varilla 12mm x 20", "monto": 240, "fecha": "2026-03-10", "url_recibo_foto": "http://..." }
]
```

---

### POST /obras/:id/gastos

Registra un gasto en una obra. El `obra_id` se toma del path.

**Request:**
```json
{
  "concepto": "10 sacos de arena",
  "monto": 45,
  "fecha": "2026-03-20",
  "url_recibo_foto": ""
}
```

**Response 201:** El gasto creado.

---

## Fases (CRUD plano)

Rutas planas para administracion directa (usadas por el CRUD generico del frontend).

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/fases` | Listar todas las fases |
| GET | `/fases/:id` | Obtener fase por ID |
| POST | `/fases` | Crear fase (requiere `obra_id` en body) |
| PUT | `/fases/:id` | Actualizar fase |
| DELETE | `/fases/:id` | Eliminar fase |

---

## Gastos (CRUD plano)

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/gastos` | Listar todos los gastos |
| GET | `/gastos/:id` | Obtener gasto por ID |
| POST | `/gastos` | Crear gasto (requiere `obra_id` en body) |
| PUT | `/gastos/:id` | Actualizar gasto |
| DELETE | `/gastos/:id` | Eliminar gasto |

---

## Clientes

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/clientes` | Listar clientes |
| GET | `/clientes/:id` | Obtener cliente por ID |
| POST | `/clientes` | Crear cliente |
| PUT | `/clientes/:id` | Actualizar cliente |
| DELETE | `/clientes/:id` | Eliminar cliente |

**Request POST:**
```json
{
  "usuario_id": 1,
  "nombre": "Juan Perez",
  "telefono": "0991234567",
  "direccion": "Av. Principal 123",
  "notas": "Cliente referido"
}
```

---

## Usuarios

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/usuarios` | Listar usuarios |
| GET | `/usuarios/:id` | Obtener usuario por ID |
| POST | `/usuarios` | Crear usuario |
| PUT | `/usuarios/:id` | Actualizar usuario |
| DELETE | `/usuarios/:id` | Eliminar usuario |

---

## Upload

### POST /upload

Sube un archivo de imagen. Usa `multipart/form-data` con el campo `foto`.

**Request:**
```
Content-Type: multipart/form-data
foto: [archivo binario]
```

**Response 201:**
```json
{
  "url": "http://localhost:3700/uploads/1711234567890-a1b2c3d4e5f6.jpg"
}
```

**Restricciones:**
- Formatos: JPEG, PNG, WebP, HEIC, HEIF
- Tamaño maximo: 5 MB
- Nombre generado: `timestamp-randomhex.extension`

**Response 400:** `{ "message": "No se recibio ningun archivo" }`

---

## Reportes

### GET /reportes/resumen-obra/:obraId

Resumen financiero completo de una obra usando aggregations SQL.

**Response 200:**
```json
{
  "obra_id": 1,
  "obra_nombre": "Ampliacion segundo piso",
  "estado": "en_progreso",
  "presupuesto": {
    "mano_de_obra": 4500,
    "anticipo_materiales": 3000,
    "total_contrato": 7500
  },
  "gastos": {
    "total_gastado": 1913,
    "cantidad_gastos": 10,
    "saldo_anticipo": 1087
  },
  "cobros": {
    "total_cobrado": 1200,
    "total_por_cobrar": 3300,
    "fases_cobradas": 1,
    "fases_pendientes": 3,
    "progreso_porcentaje": 25
  },
  "balance": {
    "ingreso_neto": -713,
    "rentabilidad_porcentaje": -15.84
  }
}
```

---

### GET /reportes/gastos-mensuales?anio=2026

Gastos mensuales agrupados. Devuelve los 12 meses con totales.

**Query params:**
- `anio` (opcional) — Año a consultar. Default: año actual.

**Response 200:**
```json
{
  "anio": 2026,
  "total_anual": 3426,
  "meses": [
    { "mes": 1, "nombre": "Enero", "total": 0 },
    { "mes": 2, "nombre": "Febrero", "total": 450 },
    { "mes": 3, "nombre": "Marzo", "total": 1463 },
    { "mes": 4, "nombre": "Abril", "total": 0 },
    { "mes": 5, "nombre": "Mayo", "total": 0 },
    { "mes": 6, "nombre": "Junio", "total": 0 },
    { "mes": 7, "nombre": "Julio", "total": 0 },
    { "mes": 8, "nombre": "Agosto", "total": 0 },
    { "mes": 9, "nombre": "Septiembre", "total": 0 },
    { "mes": 10, "nombre": "Octubre", "total": 0 },
    { "mes": 11, "nombre": "Noviembre", "total": 0 },
    { "mes": 12, "nombre": "Diciembre", "total": 0 }
  ]
}
```

---

## Codigos de error comunes

| Codigo | Significado |
|---|---|
| 400 | Validacion fallida (Zod) o regla de negocio violada |
| 401 | Token faltante, invalido o expirado |
| 403 | Usuario inactivo |
| 404 | Recurso no encontrado o no pertenece al usuario |
| 500 | Error interno del servidor |

### Formato de error de validacion (Zod)

```json
{
  "errors": [
    { "path": ["nombre"], "message": "El nombre de la obra es requerido" },
    { "path": ["presupuesto_mano_obra"], "message": "El presupuesto no puede ser negativo" }
  ]
}
```
