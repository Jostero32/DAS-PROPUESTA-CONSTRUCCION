import { makeCrud } from './crud.factory';
import { Fase } from '../entities/Fase';

export const { getAll, getById, create, update, remove } = makeCrud(Fase, 'Fase');
