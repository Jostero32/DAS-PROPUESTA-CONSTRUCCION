import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Obra } from './Obra';

@Entity()
export class Gasto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  obra_id!: number;

  @ManyToOne(() => Obra, (o) => o.gastos)
  @JoinColumn({ name: 'obra_id' })
  obra!: Obra;

  @Column()
  concepto!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ nullable: true })
  url_recibo_foto?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
