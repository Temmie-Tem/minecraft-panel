import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Server } from './server.entity';

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  provider: string;

  @Column({ name: 'providerId', length: 255 })
  providerId: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 50, unique: true })
  nickname: string;

  @Column({ length: 20 })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 양방향 관계: 사용자가 소유한 서버들
  @OneToMany(() => Server, server => server.owner)
  servers: Server[];
}
