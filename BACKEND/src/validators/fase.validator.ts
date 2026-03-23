import { z } from 'zod';

export const CreateFaseSchema = z.object({
  obra_id: z.number().int().positive('Obra es requerida'),
  nombre_fase: z.string().min(1, 'El nombre de la fase es requerido').max(200),
  monto_a_cobrar: z.number().min(0, 'El monto no puede ser negativo'),
  estado: z.enum(['pendiente', 'en_progreso', 'cobrada']).default('pendiente'),
  url_evidencia_foto: z.string().url('URL invalida').optional().or(z.literal('')),
  orden: z.number().int().positive().default(1),
});

export const UpdateFaseSchema = CreateFaseSchema.partial();

/** Schema para actualizar estado y evidencia de una fase (flujo de cobro) */
export const ActualizarFaseCobroSchema = z.object({
  estado: z.enum(['pendiente', 'en_progreso', 'cobrada']).optional(),
  url_evidencia_foto: z.string().url('URL invalida').optional().or(z.literal('')),
});
