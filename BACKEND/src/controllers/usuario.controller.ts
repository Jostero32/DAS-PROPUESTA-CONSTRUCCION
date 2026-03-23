import { makeCrud } from './crud.factory';
import { Usuario } from '../entities/Usuario';

export const { getAll, getById, create, update, remove } = makeCrud(Usuario, 'Usuario');
