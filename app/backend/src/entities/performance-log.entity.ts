import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Server } from './server.entity';

@Entity('PERFORMANCE_LOGS')
export class PerformanceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Server, server => server.performanceLogs)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @Column({ name: 'cpu_usage', type: 'real' })
  cpuUsage: number;

  @Column({ name: 'memory_usage', type: 'integer' })
  memoryUsage: number;

  @Column({ name: 'player_count', type: 'integer' })
  playerCount: number;

  @Column({ type: 'real' })
  tps: number;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
