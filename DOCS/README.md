# Constructa — Documentacion del sistema

Constructa es un MVP de gestion de obras de construccion diseñado para **maestros constructores independientes** en Ecuador. El usuario principal es el "Maestro Mayor": un profesional que maneja multiples obras simultaneas, cobra por fases completadas y necesita controlar sus gastos de materiales desde el celular.

---

## Indice de documentos

| Documento | Que contiene |
|---|---|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Diagramas de arquitectura, capas, flujo de datos, componentes |
| [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) | Modulos del sistema, flujos de usuario, reglas de negocio |
| [MODELO_DATOS.md](./MODELO_DATOS.md) | Entidades implementadas, ERD, campos y relaciones |
| [API.md](./API.md) | Referencia completa de endpoints REST |
| [GUIA_INSTALACION.md](./GUIA_INSTALACION.md) | Requisitos, Docker, desarrollo local, variables de entorno |

### Documentos de referencia (diseno original)

Estos documentos contienen el **diseno teorico completo de 21 entidades** que sirvio como punto de partida. El MVP implementa un subconjunto simplificado de 5 entidades.

| Documento | Que contiene |
|---|---|
| [README_ENTIDADES.md](./README_ENTIDADES.md) | Descripcion de las 21 entidades del diseno original |
| [README_SQL.md](./README_SQL.md) | DDL completo y diagrama ERD Mermaid del diseno original |

---

## Contexto del proyecto

### El problema

Los maestros constructores informales en Ecuador manejan sus obras con libretas, notas de WhatsApp y memoria. Esto genera:

- Perdida de control sobre cuanto han gastado en materiales
- No saben cuanto les queda por cobrar de cada obra
- No pueden demostrar al cliente el avance real con evidencias
- No tienen un documento formal (contrato/hoja de obra) para respaldar acuerdos

### La solucion

Constructa le da al maestro constructor una herramienta mobile-first para:

1. **Registrar obras** vinculadas a clientes con presupuesto definido
2. **Dividir el cobro en fases** (hitos) con montos y evidencia fotografica
3. **Registrar cada gasto** de materiales con foto del recibo
4. **Ver en tiempo real** cuanto ha cobrado, cuanto le falta, y su liquidez
5. **Generar un PDF** de "Hoja de Obra" como contrato informal
6. **Consultar reportes** de rentabilidad y gastos mensuales

### Usuario principal

**Luis** — Maestro Mayor de Guayaquil. Maneja 2-3 obras simultaneas. Usa solo su celular Android. Necesita saber en todo momento: "¿cuanto me deben?", "¿cuanto he gastado?" y "¿cuanto me queda?".
