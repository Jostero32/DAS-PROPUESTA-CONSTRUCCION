import { z } from 'zod';

export const CreateGastoSchema = z.object({
  obra_id: z.number().int().positive('Obra es requerida'),
  concepto: z.string().min(1, 'El concepto es requerido').max(300),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD'),
  url_recibo_foto: z.string().url('URL invalida').optional().or(z.literal('')),
});

export const UpdateGastoSchema = CreateGastoSchema.partial();

/** Schema para agregar gasto a una obra (obra_id viene del path param) */
export const AgregarGastoSchema = z.object({
  concepto: z.string().min(1, 'El concepto es requerido').max(300),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD'),
  url_recibo_foto: z.string().url('URL invalida').optional().or(z.literal('')),
});
