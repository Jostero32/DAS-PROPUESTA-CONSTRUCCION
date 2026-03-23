import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { Usuario } from '../entities/Usuario';
import { Cliente } from '../entities/Cliente';
import { Obra, EstadoObra } from '../entities/Obra';
import { Fase, EstadoFase } from '../entities/Fase';
import { Gasto } from '../entities/Gasto';

export async function runSeed(): Promise<void> {
  const userCount = await AppDataSource.getRepository(Usuario).count();
  if (userCount > 0) {
    console.log('Seed omitido: ya existen datos.');
    return;
  }

  console.log('Base vacia, ejecutando seed...');
  const hash = await bcrypt.hash('Luis123!', 10);

  // ── MAESTRO MAYOR ──
  const luis = await AppDataSource.getRepository(Usuario).save({
    nombre: 'Luis Morocho',
    email: 'luis@obra.com',
    password_hash: hash,
    telefono: '0987654321',
  });

  // ── CLIENTES ──
  const clientes = await AppDataSource.getRepository(Cliente).save([
    { usuario_id: luis.id, nombre: 'Sra. Martha Paredes', telefono: '0991234567', direccion: 'Cdla. Los Ceibos, Mz 4 Solar 12, Guayaquil', notas: 'Prefiere llamadas por la manana' },
    { usuario_id: luis.id, nombre: 'Don Ricardo Espinoza', telefono: '0986543210', direccion: 'Urbanizacion El Paraiso, casa 8, Duran', notas: 'Paga puntual, buen cliente' },
    { usuario_id: luis.id, nombre: 'Ing. Patricia Loor', telefono: '0978123456', direccion: 'Av. 25 de Julio, local 3, Guayaquil' },
  ]);

  // ── OBRAS ──
  const obras = await AppDataSource.getRepository(Obra).save([
    {
      usuario_id: luis.id,
      cliente_id: clientes[0].id,
      nombre: 'Ampliacion segundo piso',
      descripcion: 'Construccion de 2 dormitorios y 1 bano en segundo piso sobre losa existente',
      presupuesto_mano_obra: 4500,
      anticipo_materiales: 3000,
      estado: EstadoObra.EN_PROGRESO,
      fecha_inicio: '2026-02-15',
    },
    {
      usuario_id: luis.id,
      cliente_id: clientes[1].id,
      nombre: 'Remodelacion cocina y bano',
      descripcion: 'Demoler cocina vieja, poner ceramica nueva, instalar mesones y griferia',
      presupuesto_mano_obra: 1800,
      anticipo_materiales: 1200,
      estado: EstadoObra.PENDIENTE,
      fecha_inicio: '2026-04-01',
    },
    {
      usuario_id: luis.id,
      cliente_id: clientes[2].id,
      nombre: 'Cerramiento perimetral',
      descripcion: 'Levantar pared de bloque 40m lineales x 2.5m alto con columnas cada 3m',
      presupuesto_mano_obra: 2800,
      anticipo_materiales: 2000,
      estado: EstadoObra.COMPLETADA,
      fecha_inicio: '2025-11-01',
      fecha_fin: '2026-01-20',
    },
  ]);

  // ── FASES (Obra 1: Ampliacion) ──
  await AppDataSource.getRepository(Fase).save([
    { obra_id: obras[0].id, nombre_fase: 'Columnas y vigas de amarre', monto_a_cobrar: 1200, estado: EstadoFase.COBRADA, orden: 1, url_evidencia_foto: '/uploads/fases/columnas_ok.jpg' },
    { obra_id: obras[0].id, nombre_fase: 'Paredes de bloque levantadas', monto_a_cobrar: 1000, estado: EstadoFase.EN_PROGRESO, orden: 2 },
    { obra_id: obras[0].id, nombre_fase: 'Losa y cubierta', monto_a_cobrar: 1500, estado: EstadoFase.PENDIENTE, orden: 3 },
    { obra_id: obras[0].id, nombre_fase: 'Acabados (enlucido, piso, pintura)', monto_a_cobrar: 800, estado: EstadoFase.PENDIENTE, orden: 4 },
  ]);

  // ── FASES (Obra 2: Remodelacion) ──
  await AppDataSource.getRepository(Fase).save([
    { obra_id: obras[1].id, nombre_fase: 'Demolicion y desalojo', monto_a_cobrar: 400, estado: EstadoFase.PENDIENTE, orden: 1 },
    { obra_id: obras[1].id, nombre_fase: 'Instalacion ceramica y mesones', monto_a_cobrar: 800, estado: EstadoFase.PENDIENTE, orden: 2 },
    { obra_id: obras[1].id, nombre_fase: 'Griferia y acabados finales', monto_a_cobrar: 600, estado: EstadoFase.PENDIENTE, orden: 3 },
  ]);

  // ── FASES (Obra 3: Cerramiento - completada) ──
  await AppDataSource.getRepository(Fase).save([
    { obra_id: obras[2].id, nombre_fase: 'Cimentacion y columnas', monto_a_cobrar: 1000, estado: EstadoFase.COBRADA, orden: 1, url_evidencia_foto: '/uploads/fases/cimiento_cerr.jpg' },
    { obra_id: obras[2].id, nombre_fase: 'Levantado de paredes', monto_a_cobrar: 1200, estado: EstadoFase.COBRADA, orden: 2, url_evidencia_foto: '/uploads/fases/pared_cerr.jpg' },
    { obra_id: obras[2].id, nombre_fase: 'Enlucido y pintura', monto_a_cobrar: 600, estado: EstadoFase.COBRADA, orden: 3, url_evidencia_foto: '/uploads/fases/pintura_cerr.jpg' },
  ]);

  // ── GASTOS (Obra 1: anticipo $3000) ──
  await AppDataSource.getRepository(Gasto).save([
    { obra_id: obras[0].id, concepto: 'Cemento Holcim x 20 sacos', monto: 170, fecha: '2026-02-16' },
    { obra_id: obras[0].id, concepto: 'Varilla 12mm x 15 qq', monto: 630, fecha: '2026-02-16' },
    { obra_id: obras[0].id, concepto: 'Bloques 15cm x 500 unidades', monto: 175, fecha: '2026-02-17' },
    { obra_id: obras[0].id, concepto: 'Arena gruesa 3 volquetas', monto: 195, fecha: '2026-02-17' },
    { obra_id: obras[0].id, concepto: 'Piedra triturada 2 volquetas', monto: 160, fecha: '2026-02-18' },
    { obra_id: obras[0].id, concepto: 'Alambre de amarre #18 x 10 rollos', monto: 45, fecha: '2026-02-18' },
    { obra_id: obras[0].id, concepto: 'Transporte materiales', monto: 80, fecha: '2026-02-18', url_recibo_foto: '/uploads/gastos/transporte.jpg' },
    { obra_id: obras[0].id, concepto: 'Clavos y estribos', monto: 35, fecha: '2026-02-20' },
    { obra_id: obras[0].id, concepto: 'Tabla de encofrado', monto: 120, fecha: '2026-02-22' },
    { obra_id: obras[0].id, concepto: 'Tubo PVC 4 pulgadas x 6', monto: 78, fecha: '2026-03-01' },
  ]);

  // ── GASTOS (Obra 3: cerramiento completado) ──
  await AppDataSource.getRepository(Gasto).save([
    { obra_id: obras[2].id, concepto: 'Cemento x 40 sacos', monto: 340, fecha: '2025-11-02' },
    { obra_id: obras[2].id, concepto: 'Bloques 15cm x 1200 unidades', monto: 420, fecha: '2025-11-03' },
    { obra_id: obras[2].id, concepto: 'Varilla 10mm x 10 qq', monto: 390, fecha: '2025-11-03' },
    { obra_id: obras[2].id, concepto: 'Arena y piedra', monto: 280, fecha: '2025-11-05' },
    { obra_id: obras[2].id, concepto: 'Pintura exterior 4 canecas', monto: 120, fecha: '2025-12-20' },
    { obra_id: obras[2].id, concepto: 'Varios (alambre, clavos, etc)', monto: 65, fecha: '2025-11-10' },
  ]);

  console.log('Seed completado. Usuario: luis@obra.com / Luis123!');
}
