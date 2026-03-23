import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Usuario } from './Usuario';
import { Obra } from './Obra';

@Entity()
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  usuario_id!: number;

  @ManyToOne(() => Usuario, (u) => u.clientes)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column()
  nombre!: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  direccion?: string;

  @Column({ type: 'text', nullable: true })
  notas?: string;

  @OneToMany(() => Obra, (o) => o.cliente)
  obras!: Obra[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
