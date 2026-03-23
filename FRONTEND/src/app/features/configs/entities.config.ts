import { EntityPageConfig } from '../../core/models/entity-config.model';

function opts(values: string[]): { value: string; label: string }[] {
  return values.map((v) => ({ value: v, label: v.replace(/_/g, ' ') }));
}

export const ENTITY_CONFIGS: Record<string, EntityPageConfig> = {
  clientes: {
    title: 'Clientes',
    apiPath: 'clientes',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'telefono', label: 'Telefono' },
      { key: 'direccion', label: 'Direccion' },
    ],
    formFields: [
      { key: 'usuario_id', label: 'Maestro', type: 'select', required: true, entitySource: { apiPath: 'usuarios', labelKey: 'nombre' } },
      { key: 'nombre', label: 'Nombre', type: 'text', required: true },
      { key: 'telefono', label: 'Telefono', type: 'text' },
      { key: 'direccion', label: 'Direccion', type: 'text' },
      { key: 'notas', label: 'Notas', type: 'textarea' },
    ],
  },

  obras: {
    title: 'Obras',
    apiPath: 'obras',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Obra' },
      { key: 'presupuesto_mano_obra', label: 'Mano de Obra $', type: 'number' },
      { key: 'anticipo_materiales', label: 'Anticipo $', type: 'number' },
      { key: 'estado', label: 'Estado', type: 'enum' },
      { key: 'fecha_inicio', label: 'Inicio', type: 'date' },
    ],
    formFields: [
      { key: 'usuario_id', label: 'Maestro', type: 'select', required: true, entitySource: { apiPath: 'usuarios', labelKey: 'nombre' } },
      { key: 'cliente_id', label: 'Cliente', type: 'select', required: true, entitySource: { apiPath: 'clientes', labelKey: 'nombre' } },
      { key: 'nombre', label: 'Nombre de la Obra', type: 'text', required: true },
      { key: 'descripcion', label: 'Descripcion', type: 'textarea' },
      { key: 'presupuesto_mano_obra', label: 'Presupuesto Mano de Obra ($)', type: 'number', required: true },
      { key: 'anticipo_materiales', label: 'Anticipo Materiales ($)', type: 'number' },
      { key: 'estado', label: 'Estado', type: 'select', options: opts(['pendiente', 'en_progreso', 'completada', 'cancelada']) },
      { key: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
      { key: 'fecha_fin', label: 'Fecha Fin', type: 'date' },
    ],
  },

  fases: {
    title: 'Fases / Cobros',
    apiPath: 'fases',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'obra_id', label: 'Obra ID' },
      { key: 'nombre_fase', label: 'Fase' },
      { key: 'monto_a_cobrar', label: 'Monto $', type: 'number' },
      { key: 'estado', label: 'Estado', type: 'enum' },
      { key: 'orden', label: 'Orden' },
    ],
    formFields: [
      { key: 'obra_id', label: 'Obra', type: 'select', required: true, entitySource: { apiPath: 'obras', labelKey: 'nombre' } },
      { key: 'nombre_fase', label: 'Nombre de la Fase', type: 'text', required: true },
      { key: 'monto_a_cobrar', label: 'Monto a Cobrar ($)', type: 'number', required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: opts(['pendiente', 'en_progreso', 'cobrada']) },
      { key: 'url_evidencia_foto', label: 'URL Foto Evidencia', type: 'text' },
      { key: 'orden', label: 'Orden', type: 'number' },
    ],
  },

  gastos: {
    title: 'Gastos',
    apiPath: 'gastos',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'obra_id', label: 'Obra ID' },
      { key: 'concepto', label: 'Concepto' },
      { key: 'monto', label: 'Monto $', type: 'number' },
      { key: 'fecha', label: 'Fecha', type: 'date' },
    ],
    formFields: [
      { key: 'obra_id', label: 'Obra', type: 'select', required: true, entitySource: { apiPath: 'obras', labelKey: 'nombre' } },
      { key: 'concepto', label: 'Concepto', type: 'text', required: true },
      { key: 'monto', label: 'Monto ($)', type: 'number', required: true },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      { key: 'url_recibo_foto', label: 'URL Foto Recibo', type: 'text' },
    ],
  },
};
