import { z } from 'zod';

export const CreateUsuarioSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  password_hash: z.string().min(6),
  telefono: z.string().optional(),
  activo: z.boolean().optional(),
});

export const UpdateUsuarioSchema = CreateUsuarioSchema.partial();
