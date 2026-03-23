import { z } from 'zod';

export const CreateClienteSchema = z.object({
  usuario_id: z.number().int().positive(),
  nombre: z.string().min(1),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
});

export const UpdateClienteSchema = CreateClienteSchema.partial();
