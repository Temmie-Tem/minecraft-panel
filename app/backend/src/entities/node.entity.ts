import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Server } from './server.entity';

@Entity('NODES')
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  fqdn: string;

  @Column({ name: 'auth_token', type: 'text' })
  authToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 양방향 관계: 이 노드에 속한 서버들
  @OneToMany(() => Server, server => server.node)
  servers: Server[];
}
