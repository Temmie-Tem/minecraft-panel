import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Server } from './server.entity';
import { Player } from './player.entity';

@Entity('COMMAND_LOGS')
export class CommandLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Server, server => server.commandLogs)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @ManyToOne(() => Player, player => player.commandLogs)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ length: 500 })
  command: string;

  @Column({ type: 'text', nullable: true })
  result: string | null;

  @CreateDateColumn({ name: 'executed_at' })
  executedAt: Date;
}
