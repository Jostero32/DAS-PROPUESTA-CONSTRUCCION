import { Request, Response } from 'express';
import { EntityTarget, ObjectLiteral, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../config/database';

export function makeCrud<T extends ObjectLiteral>(entity: EntityTarget<T>, label: string) {
  const repo = () => AppDataSource.getRepository(entity);

  return {
    getAll: async (_req: Request, res: Response): Promise<void> => {
      try {
        res.json(await repo().find());
      } catch (e) {
        res.status(500).json({ message: `Error al obtener ${label}`, error: String(e) });
      }
    },

    getById: async (req: Request, res: Response): Promise<void> => {
      try {
        const item = await repo().findOneBy({ id: Number(req.params.id) } as FindOptionsWhere<T>);
        if (!item) { res.status(404).json({ message: `${label} no encontrado` }); return; }
        res.json(item);
      } catch (e) {
        res.status(500).json({ message: `Error al obtener ${label}`, error: String(e) });
      }
    },

    create: async (req: Request, res: Response): Promise<void> => {
      try {
        const r = repo();
        res.status(201).json(await r.save(r.create(req.body)));
      } catch (e) {
        res.status(500).json({ message: `Error al crear ${label}`, error: String(e) });
      }
    },

    update: async (req: Request, res: Response): Promise<void> => {
      try {
        const r = repo();
        const item = await r.findOneBy({ id: Number(req.params.id) } as FindOptionsWhere<T>);
        if (!item) { res.status(404).json({ message: `${label} no encontrado` }); return; }
        r.merge(item, req.body);
        res.json(await r.save(item));
      } catch (e) {
        res.status(500).json({ message: `Error al actualizar ${label}`, error: String(e) });
      }
    },

    remove: async (req: Request, res: Response): Promise<void> => {
      try {
        const r = repo();
        const item = await r.findOneBy({ id: Number(req.params.id) } as FindOptionsWhere<T>);
        if (!item) { res.status(404).json({ message: `${label} no encontrado` }); return; }
        await r.remove(item);
        res.status(204).send();
      } catch (e) {
        res.status(500).json({ message: `Error al eliminar ${label}`, error: String(e) });
      }
    },
  };
}
