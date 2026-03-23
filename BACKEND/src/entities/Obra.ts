import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Usuario } from './Usuario';
import { Cliente } from './Cliente';
import { Fase } from './Fase';
import { Gasto } from './Gasto';

export enum EstadoObra {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
}

@Entity()
export class Obra {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  usuario_id!: number;

  @Column()
  cliente_id!: number;

  @ManyToOne(() => Usuario, (u) => u.obras)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Cliente, (c) => c.obras)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  @Column()
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  presupuesto_mano_obra!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  anticipo_materiales!: number;

  @Column({ type: 'enum', enum: EstadoObra, default: EstadoObra.PENDIENTE })
  estado!: EstadoObra;

  @Column({ type: 'date', nullable: true })
  fecha_inicio?: string;

  @Column({ type: 'date', nullable: true })
  fecha_fin?: string;

  @OneToMany(() => Fase, (f) => f.obra)
  fases!: Fase[];

  @OneToMany(() => Gasto, (g) => g.obra)
  gastos!: Gasto[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
