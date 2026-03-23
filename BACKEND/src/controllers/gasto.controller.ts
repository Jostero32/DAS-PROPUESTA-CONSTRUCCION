import { makeCrud } from './crud.factory';
import { Gasto } from '../entities/Gasto';

export const { getAll, getById, create, update, remove } = makeCrud(Gasto, 'Gasto');
