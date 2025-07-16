import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

// 테이블명을 모두 대문자로 통일
@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  provider: string;

  @Column({ length: 255 })
  providerId: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 50, unique: true })
  nickname: string;

  @Column({ length: 20 })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}