import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Cliente } from './Cliente';
import { Obra } from './Obra';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => Cliente, (c) => c.usuario)
  clientes!: Cliente[];

  @OneToMany(() => Obra, (o) => o.usuario)
  obras!: Obra[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
