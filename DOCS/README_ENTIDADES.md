# Entidades del sistema — Descripción y justificación

Documentación de las **21 entidades** que componen la base de datos del sistema de gestión de construcciones. Organizadas por módulo funcional.

---

## Índice

- [Módulo 1 — Proyectos y contratos](#módulo-1--proyectos-y-contratos)
- [Módulo 2 — Hitos y materiales](#módulo-2--hitos-y-materiales)
- [Módulo 3 — Pagos y cobros](#módulo-3--pagos-y-cobros)
- [Módulo 4 — Usuarios y acceso](#módulo-4--usuarios-y-acceso)
- [Relaciones cruzadas entre módulos](#relaciones-cruzadas-entre-módulos)

---

## Módulo 1 — Proyectos y contratos

### EMPRESA

Representa a la organización propietaria o gestora del proyecto. Es el punto de entrada de todo el sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `nombre` | varchar | Razón social |
| `ruc` | varchar | RUC o número de identificación tributaria |
| `direccion` | varchar | Dirección fiscal |
| `telefono` | varchar | Teléfono de contacto |
| `email` | varchar | Correo institucional |
| `tipo` | varchar | Tipo de empresa: pública, privada, mixta |

**Justificación:** Se separa de `CONTRATISTA` para distinguir claramente entre quien financia/gestiona el proyecto y quien lo ejecuta. Permite arquitectura multiempresa en el futuro.

---

### PROYECTO

Entidad central del sistema. Todo gira alrededor del proyecto de construcción.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `codigo` | varchar | Código interno del proyecto |
| `nombre` | varchar | Nombre descriptivo |
| `descripcion` | text | Descripción detallada del alcance |
| `ubicacion` | varchar | Ubicación geográfica de la obra |
| `presupuesto_total` | decimal | Presupuesto aprobado total |
| `fecha_inicio` | date | Fecha de inicio planificada |
| `fecha_fin_planificada` | date | Fecha de entrega esperada |
| `fecha_fin_real` | date | Fecha de cierre real (null hasta el cierre) |
| `estado` | varchar | planificado / en_ejecucion / pausado / cerrado |
| `empresa_id` | int FK | Empresa gestora del proyecto |
| `responsable_id` | int FK | Usuario responsable interno |

**Justificación:** `fecha_fin_real` se mantiene separada de `fecha_fin_planificada` para calcular desviaciones de plazo. `presupuesto_total` permite comparar contra el gasto acumulado de contratos.

---

### CONTRATO

Acuerdo formal entre la empresa y un contratista para ejecutar una parte específica del proyecto.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `numero` | varchar | Número oficial del contrato |
| `tipo` | varchar | obra / suministro / consultoría / mixto |
| `proyecto_id` | int FK | Proyecto al que pertenece |
| `contratista_id` | int FK | Contratista que ejecuta |
| `monto_total` | decimal | Valor total contratado |
| `fecha_firma` | date | Fecha de suscripción |
| `fecha_inicio` | date | Inicio de ejecución |
| `fecha_fin` | date | Fecha de vencimiento |
| `moneda` | varchar | USD / EUR / local |
| `estado` | varchar | borrador / vigente / liquidado / terminado |
| `clausulas` | text | Cláusulas especiales relevantes |

**Justificación:** Un proyecto puede tener múltiples contratos (por ejemplo, uno de obra civil, uno de instalaciones eléctricas y uno de acabados). Separarlos permite presupuestos independientes, cronogramas distintos y responsables diferentes.

---

### CONTRATISTA

Empresa o persona natural que ejecuta el contrato.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `nombre` | varchar | Razón social o nombre |
| `ruc` | varchar | Identificación tributaria |
| `especialidad` | varchar | Área de especialización |
| `contacto` | varchar | Nombre del contacto principal |
| `email` | varchar | Correo de contacto |

**Justificación:** Entidad independiente de `EMPRESA` para mantener un catálogo de contratistas reutilizable entre proyectos sin duplicar datos.

---

## Módulo 2 — Hitos y materiales

### HITO

Entregable específico dentro de un contrato. Define el avance medible de la obra.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `contrato_id` | int FK | Contrato al que pertenece |
| `nombre` | varchar | Nombre del hito |
| `descripcion` | text | Descripción del entregable |
| `orden` | int | Secuencia dentro del contrato |
| `porcentaje_avance` | decimal | % de avance completado (0-100) |
| `fecha_planificada` | date | Fecha esperada de cumplimiento |
| `fecha_real` | date | Fecha real de cumplimiento |
| `monto_asociado` | decimal | Monto que se libera al completar el hito |
| `estado` | varchar | pendiente / en_progreso / completado / rechazado |

**Justificación:** Los hitos son el mecanismo de control de avance más importante del sistema. `monto_asociado` permite implementar pagos por avance (milestone-based payments). `fecha_real` vs `fecha_planificada` habilita análisis de desviación de cronograma.

---

### TAREA

Actividad específica que debe completarse para alcanzar un hito.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `hito_id` | int FK | Hito al que pertenece |
| `responsable_id` | int FK | Usuario responsable |
| `nombre` | varchar | Nombre de la tarea |
| `fecha_inicio` | date | Inicio planificado |
| `fecha_fin` | date | Fin planificado |
| `estado` | varchar | pendiente / en_progreso / completada |
| `observaciones` | text | Notas del responsable |

**Justificación:** Permite descomponer hitos complejos en actividades manejables y asignar responsabilidades individuales a miembros del equipo.

---

### EVIDENCIA

Documento, foto o archivo que respalda el cumplimiento de un hito.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `hito_id` | int FK | Hito que respalda |
| `usuario_id` | int FK | Usuario que cargó el archivo |
| `tipo` | varchar | foto / acta / informe / certificado |
| `url_archivo` | varchar | Ruta del archivo en almacenamiento |
| `fecha_carga` | date | Fecha de carga |

**Justificación:** Sin evidencias, los hitos son declaraciones sin sustento. Esta entidad obliga a documentar el avance antes de poder generar un cobro.

---

### MATERIAL

Catálogo maestro de insumos y materiales de construcción.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `codigo` | varchar | Código interno o UNSPSC |
| `nombre` | varchar | Descripción del material |
| `unidad` | varchar | Unidad de medida: m3, kg, unidad, etc. |
| `categoria` | varchar | Categoría: estructura, acabados, instalaciones |
| `precio_referencial` | decimal | Precio de referencia para presupuestar |

**Justificación:** Catálogo centralizado que evita la creación duplicada de materiales en cada requisición. El `precio_referencial` sirve para validar desviaciones en facturas reales.

---

### REQUISICION

Solicitud formal de materiales para un proyecto.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `proyecto_id` | int FK | Proyecto que requiere los materiales |
| `solicitante_id` | int FK | Usuario que genera la requisición |
| `fecha` | date | Fecha de la solicitud |
| `estado` | varchar | borrador / pendiente / aprobada / rechazada |
| `observaciones` | text | Justificación o notas |

**Justificación:** Formaliza el proceso de adquisición. Ninguna compra debe ejecutarse sin una requisición aprobada, lo que da control presupuestario antes del gasto.

---

### REQUISICION_DETALLE

Línea de detalle de cada material incluido en una requisición.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `requisicion_id` | int FK | Requisición a la que pertenece |
| `material_id` | int FK | Material solicitado |
| `cantidad_solicitada` | decimal | Cantidad requerida |
| `cantidad_aprobada` | decimal | Cantidad aprobada (puede ser menor) |
| `precio_unitario` | decimal | Precio estimado al momento de la solicitud |

**Justificación:** Separar el encabezado del detalle es patrón maestro-detalle estándar. `cantidad_aprobada` permite aprobaciones parciales sin rechazar toda la requisición.

---

### FACTURA

Documento fiscal emitido por el contratista o proveedor.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `numero` | varchar | Número de factura |
| `contratista_id` | int FK | Quien emite la factura |
| `proyecto_id` | int FK | Proyecto al que se carga |
| `requisicion_id` | int FK | Requisición que origina (nullable) |
| `fecha_emision` | date | Fecha de la factura |
| `fecha_vencimiento` | date | Fecha límite de pago |
| `subtotal` | decimal | Monto antes de impuestos |
| `impuesto` | decimal | Valor del impuesto |
| `total` | decimal | Total a pagar |
| `estado` | varchar | recibida / verificada / pagada / anulada |

**Justificación:** `requisicion_id` es nullable para permitir facturas directas (sin requisición previa) como contratos de servicios. `fecha_vencimiento` permite gestionar alertas de pago y evitar mora.

---

### FACTURA_DETALLE

Línea de detalle de cada ítem en la factura.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `factura_id` | int FK | Factura a la que pertenece |
| `material_id` | int FK | Material facturado |
| `cantidad` | decimal | Cantidad entregada |
| `precio_unitario` | decimal | Precio real facturado |
| `subtotal` | decimal | cantidad × precio_unitario |

**Justificación:** Permite comparar precio facturado vs precio de la requisición y detectar sobreprecios. También permite consolidar cuánto se gastó por tipo de material en todo el proyecto.

---

## Módulo 3 — Pagos y cobros

### CUENTA_BANCARIA

Cuenta de la empresa desde/hacia donde se mueven los fondos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `empresa_id` | int FK | Empresa propietaria |
| `banco` | varchar | Nombre del banco |
| `numero_cuenta` | varchar | Número de cuenta |
| `tipo` | varchar | corriente / ahorros |
| `moneda` | varchar | USD / EUR / etc. |
| `saldo_actual` | decimal | Saldo actualizado tras cada transacción |

**Justificación:** Centralizar las cuentas bancarias permite que todos los pagos y cobros queden vinculados a un saldo trazable. `saldo_actual` se actualiza con cada `PAGO` y `COBRO_PAGO` para mantener el saldo en tiempo real.

---

### ORDEN_PAGO

Instrucción formal de pago aprobada antes de ejecutar cualquier egreso.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `numero` | varchar | Número de orden |
| `contrato_id` | int FK | Contrato que origina el pago |
| `factura_id` | int FK | Factura que respalda el pago |
| `aprobador_id` | int FK | Usuario que aprueba |
| `monto` | decimal | Monto a pagar |
| `fecha_solicitud` | date | Cuando se generó la orden |
| `fecha_aprobacion` | date | Cuando fue aprobada |
| `estado` | varchar | borrador / pendiente / aprobada / rechazada / pagada |
| `concepto` | varchar | Descripción del concepto de pago |

**Justificación:** Implementa el principio de doble control: quien solicita el pago no puede aprobarlo. Ningún pago se ejecuta sin una orden en estado `aprobada`. Esto es requisito en auditorías de empresas públicas y privadas de construcción.

---

### PAGO

Ejecución real del pago hacia el contratista o proveedor.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `orden_pago_id` | int FK | Orden que autoriza este pago |
| `cuenta_origen_id` | int FK | Cuenta bancaria de la empresa |
| `monto` | decimal | Monto efectivamente pagado |
| `fecha_pago` | date | Fecha de la transferencia |
| `metodo` | varchar | transferencia / cheque / efectivo |
| `referencia_bancaria` | varchar | Número de transacción bancaria |
| `comprobante_url` | varchar | URL del comprobante de pago |
| `estado` | varchar | procesado / devuelto / anulado |

**Justificación:** Separar la orden de pago de su ejecución permite que un pago sea devuelto o anulado sin afectar la orden original. `referencia_bancaria` es clave para la conciliación posterior.

---

### COBRO

Planilla de cobro al cliente por avance de obra completado.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `contrato_id` | int FK | Contrato que origina el cobro |
| `hito_id` | int FK | Hito completado que habilita el cobro |
| `numero_planilla` | varchar | Número de la planilla de cobro |
| `monto` | decimal | Monto a cobrar |
| `fecha_emision` | date | Fecha de la planilla |
| `fecha_cobro` | date | Fecha en que se recibió el pago |
| `estado` | varchar | emitida / aprobada / cobrada / rechazada |

**Justificación:** La vinculación obligatoria con `hito_id` impide generar cobros ficticios. Solo se puede cobrar cuando hay un hito en estado `completado` con evidencias adjuntas.

---

### COBRO_PAGO

Registro del ingreso bancario vinculado al cobro.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `cobro_id` | int FK | Cobro que se está pagando |
| `cuenta_destino_id` | int FK | Cuenta donde se recibe el dinero |
| `monto_recibido` | decimal | Monto efectivamente recibido |
| `fecha` | date | Fecha de acreditación |
| `referencia` | varchar | Referencia de la transferencia recibida |

**Justificación:** Permite que un cobro sea pagado parcialmente en distintas fechas (abonos), manteniendo el historial de cada ingreso por separado.

---

### RETENCION

Garantía económica retenida al contratista durante la ejecución del contrato.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `contrato_id` | int FK | Contrato al que aplica |
| `tipo` | varchar | garantia_cumplimiento / fondo_garantia / otro |
| `porcentaje` | decimal | Porcentaje sobre el monto contratado |
| `monto` | decimal | Valor retenido calculado |
| `fecha_aplicacion` | date | Cuando se aplica la retención |
| `fecha_devolucion` | date | Cuando se devuelve (null hasta devolución) |
| `estado` | varchar | activa / devuelta / ejecutada |

**Justificación:** Las retenciones son obligatorias en la mayoría de contratos de construcción pública y privada. Deben tener su propio ciclo de vida separado del pago regular.

---

### CONCILIACION

Proceso de cierre que verifica que los registros del sistema coinciden con el estado real de la cuenta bancaria.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `cuenta_id` | int FK | Cuenta bancaria conciliada |
| `usuario_id` | int FK | Usuario que realiza la conciliación |
| `fecha` | date | Fecha de corte |
| `saldo_libro` | decimal | Saldo en el sistema |
| `saldo_banco` | decimal | Saldo según estado de cuenta |
| `diferencia` | decimal | saldo_banco − saldo_libro |
| `estado` | varchar | en_proceso / conciliada / con_diferencias |

**Justificación:** Sin conciliación, el `saldo_actual` de la cuenta bancaria puede divergir de la realidad por transacciones no registradas, errores de imputación o pagos bancarios directos.

---

### CONCILIACION_ITEM

Cada transacción individual que forma parte de la conciliación.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `conciliacion_id` | int FK | Conciliación a la que pertenece |
| `tipo` | varchar | pago / cobro / ajuste / cargo_bancario |
| `referencia_id` | int | ID del registro origen (pago o cobro) |
| `monto` | decimal | Monto del ítem |
| `descripcion` | varchar | Descripción del movimiento |
| `conciliado` | boolean | Si fue encontrado en el estado de cuenta |

**Justificación:** Permite marcar ítem por ítem cuáles movimientos ya fueron identificados en el estado de cuenta bancario y cuáles quedan pendientes de aclaración.

---

## Módulo 4 — Usuarios y acceso

### USUARIO

Persona que interactúa con la plataforma. Aparece como FK en todas las operaciones críticas.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int PK | Identificador único |
| `nombre` | varchar | Nombre completo |
| `email` | varchar | Correo electrónico (login) |
| `rol` | varchar | admin / gerente / supervisor / financiero / operativo |
| `empresa_id` | int FK | Empresa a la que pertenece |

**Justificación:** El `rol` determina las acciones permitidas. Un usuario con rol `operativo` puede crear requisiciones pero no aprobar órdenes de pago. Un `financiero` puede ejecutar pagos pero no modificar hitos. Esta separación es crítica para el control interno.

---

## Relaciones cruzadas entre módulos

Las siguientes relaciones conectan entidades de módulos distintos y son el núcleo de la integración del sistema:

| Relación | Módulos | Significado |
|---|---|---|
| `HITO → COBRO` | 2 → 3 | Solo se cobra lo que tiene un hito completado |
| `FACTURA → ORDEN_PAGO` | 2 → 3 | Todo pago requiere una factura verificada |
| `CONTRATO → RETENCION` | 1 → 3 | Las garantías nacen del contrato |
| `PROYECTO → REQUISICION` | 1 → 2 | Las compras se cargan al proyecto |
| `USUARIO → ORDEN_PAGO` | 4 → 3 | El aprobador es un usuario con rol financiero |
| `USUARIO → EVIDENCIA` | 4 → 2 | Se sabe quién cargó cada documento |
| `EMPRESA → CUENTA_BANCARIA` | 1 → 3 | Los fondos pertenecen a la empresa |

---

## Resumen de entidades por módulo

| Módulo | Entidades | Total |
|---|---|---|
| Proyectos y contratos | EMPRESA, PROYECTO, CONTRATO, CONTRATISTA | 4 |
| Hitos y materiales | HITO, TAREA, EVIDENCIA, MATERIAL, REQUISICION, REQUISICION_DETALLE, FACTURA, FACTURA_DETALLE | 8 |
| Pagos y cobros | CUENTA_BANCARIA, ORDEN_PAGO, PAGO, COBRO, COBRO_PAGO, RETENCION, CONCILIACION, CONCILIACION_ITEM | 8 |
| Usuarios y acceso | USUARIO | 1 |
| **Total** | | **21** |
