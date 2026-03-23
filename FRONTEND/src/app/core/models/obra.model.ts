// ─── Entidades base (match directo con las entities TypeORM) ────

export type EstadoObra = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
export type EstadoFase = 'pendiente' | 'en_progreso' | 'cobrada';

export interface Cliente {
  id: number;
  usuario_id: number;
  nombre: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface Obra {
  id: number;
  usuario_id: number;
  cliente_id: number;
  nombre: string;
  descripcion?: string;
  presupuesto_mano_obra: number;
  anticipo_materiales: number;
  estado: EstadoObra;
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at: string;
  updated_at: string;
}

export interface Fase {
  id: number;
  obra_id: number;
  nombre_fase: string;
  monto_a_cobrar: number;
  estado: EstadoFase;
  url_evidencia_foto?: string;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Gasto {
  id: number;
  obra_id: number;
  concepto: string;
  monto: number;
  fecha: string;
  url_recibo_foto?: string;
  created_at: string;
  updated_at: string;
}

// ─── DTOs extendidos (lo que devuelve GET /obras y GET /obras/:id) ──

/** GET /obras → lista con resumen */
export interface ObraResumen extends Obra {
  cliente?: Cliente;
  fases?: Fase[];
  gastos?: Gasto[];
  total_fases: number;
  fases_cobradas: number;
  total_gastado: number;
  cliente_nombre?: string;
}

/** GET /obras/:id → detalle completo con métricas */
export interface ObraDetalle extends Obra {
  cliente?: Cliente;
  fases: Fase[];
  gastos: Gasto[];
  total_fases: number;
  fases_cobradas: number;
  monto_cobrado: number;
  monto_pendiente: number;
  total_gastado: number;
  saldo_anticipo: number;
}

// ─── Payloads para crear/actualizar ─────────────────────────────

export interface CreateObraPayload {
  cliente_id: number;
  nombre: string;
  descripcion?: string;
  presupuesto_mano_obra: number;
  anticipo_materiales?: number;
  estado?: EstadoObra;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface UpdateObraPayload extends Partial<CreateObraPayload> {}

export interface CambiarEstadoPayload {
  estado: EstadoObra;
}

export interface CreateFasePayload {
  nombre_fase: string;
  monto_a_cobrar: number;
  estado?: EstadoFase;
  url_evidencia_foto?: string;
  orden?: number;
}

export interface ActualizarFaseCobroPayload {
  estado?: EstadoFase;
  url_evidencia_foto?: string;
}

export interface AgregarGastoPayload {
  concepto: string;
  monto: number;
  fecha: string;
  url_recibo_foto?: string;
}
