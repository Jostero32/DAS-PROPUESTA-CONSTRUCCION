import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Obra } from './Obra';

export enum EstadoFase {
  PENDIENTE = 'pendiente',
  EN_PROGRESO = 'en_progreso',
  COBRADA = 'cobrada',
}

@Entity()
export class Fase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  obra_id!: number;

  @ManyToOne(() => Obra, (o) => o.fases)
  @JoinColumn({ name: 'obra_id' })
  obra!: Obra;

  @Column()
  nombre_fase!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_a_cobrar!: number;

  @Column({ type: 'enum', enum: EstadoFase, default: EstadoFase.PENDIENTE })
  estado!: EstadoFase;

  @Column({ nullable: true })
  url_evidencia_foto?: string;

  @Column({ default: 1 })
  orden!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
