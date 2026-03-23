import { makeCrud } from './crud.factory';
import { Cliente } from '../entities/Cliente';

export const { getAll, getById, create, update, remove } = makeCrud(Cliente, 'Cliente');
