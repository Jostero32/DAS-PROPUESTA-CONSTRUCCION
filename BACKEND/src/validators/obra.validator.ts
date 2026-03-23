import { z } from 'zod';

export const CreateObraSchema = z.object({
  cliente_id: z.number().int().positive('Cliente es requerido'),
  nombre: z.string().min(1, 'El nombre de la obra es requerido').max(200),
  descripcion: z.string().max(1000).optional(),
  presupuesto_mano_obra: z.number().min(0, 'El presupuesto no puede ser negativo'),
  anticipo_materiales: z.number().min(0, 'El anticipo no puede ser negativo').default(0),
  estado: z.enum(['pendiente', 'en_progreso', 'completada', 'cancelada']).default('pendiente'),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD').optional(),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD').optional(),
});

export const UpdateObraSchema = CreateObraSchema.partial();

/** Schema para cambiar solo el estado de una obra */
export const CambiarEstadoObraSchema = z.object({
  estado: z.enum(['pendiente', 'en_progreso', 'completada', 'cancelada']),
});
